/**
 * @module main
 * Application entry point.
 * Initializes components, manages state, and wires event flow.
 */

import './style.css';

import { initFileUpload, showFileInfo, resetFileUpload } from './components/FileUpload.js';
import { initFindReplace, showFindReplaceSection, hideFindReplaceSection, getOptions, setButtonStates } from './components/FindReplace.js';
import { initReplacementList, getPairs, resetReplacementList } from './components/ReplacementList.js';
import { renderTextPreview, renderHtmlPreview, renderEmptyState } from './components/Preview.js';
import { updateMatchCount, hideMatchInfo } from './components/MatchInfo.js';
import { initThemeToggle } from './components/ThemeToggle.js';
import { getFileExtension } from './utils/fileHelpers.js';
import { downloadFile } from './utils/download.js';
import { loadDocx, getDocumentXml, extractTextFromXml, replaceInDocx, generateHtmlPreview, exportDocx } from './core/docxProcessor.js';
import { loadTxt, exportTxt } from './core/txtProcessor.js';
import { replaceAll } from './core/replacer.js';

// ── App State ──────────────────────────────────────────────────
const state = {
    /** @type {File|null} */
    currentFile: null,
    /** @type {'docx'|'txt'|null} */
    fileType: null,
    /** @type {string} - Original text content (for .txt) */
    originalText: '',
    /** @type {string} - Current working text (for .txt) */
    currentText: '',
    /** @type {Object|null} - Original ZIP (for .docx) */
    originalZip: null,
    /** @type {Object|null} - Current working ZIP (for .docx) */
    currentZip: null,
    /** @type {string} - HTML preview (for .docx) */
    previewHtml: '',
    /** @type {string|null} - Previous state for undo */
    undoText: null,
    /** @type {Object|null} - Previous ZIP for undo */
    undoZip: null,
    /** @type {boolean} - Whether a replacement has been applied */
    hasReplaced: false,
};

// ── Initialize ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();

    initFileUpload({
        onFileSelected: handleFileSelected,
        onError: showToast,
    });

    initFindReplace({
        onReplaceAll: handleReplaceAll,
        onUndo: handleUndo,
        onDownload: handleDownload,
        onOptionsChange: handleInputChange,
    });

    initReplacementList({
        onInputChange: handleInputChange,
    });

    document.getElementById('file-remove').addEventListener('click', handleFileRemove);
});

// ── File Handling ──────────────────────────────────────────────

/**
 * Processes a newly selected file.
 *
 * @param {File} file - The uploaded file.
 */
async function handleFileSelected(file) {
    try {
        state.currentFile = file;
        const ext = getFileExtension(file);
        state.fileType = ext === '.docx' ? 'docx' : 'txt';

        showFileInfo(file.name);
        showFindReplaceSection();

        if (state.fileType === 'txt') {
            await loadTextFile(file);
        } else {
            await loadDocxFile(file);
        }

        resetUndoState();
        handleInputChange();
        showToast('File loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading file:', error);
        showToast('Failed to load file. Please try again.', 'error');
    }
}

/**
 * Loads and previews a .txt file.
 *
 * @param {File} file - The .txt file.
 */
async function loadTextFile(file) {
    state.originalText = await loadTxt(file);
    state.currentText = state.originalText;
}

/**
 * Loads and previews a .docx file.
 *
 * @param {File} file - The .docx file.
 */
async function loadDocxFile(file) {
    state.originalZip = await loadDocx(file);
    // Clone the zip for working copy
    const arrayBuffer = await file.arrayBuffer();
    state.currentZip = await loadDocx(file);
    state.previewHtml = await generateHtmlPreview(arrayBuffer);

    // Also extract text for matching purposes
    const xml = await getDocumentXml(state.originalZip);
    state.originalText = extractTextFromXml(xml);
    state.currentText = state.originalText;
}

/**
 * Removes the current file and resets everything.
 */
function handleFileRemove() {
    state.currentFile = null;
    state.fileType = null;
    state.originalText = '';
    state.currentText = '';
    state.originalZip = null;
    state.currentZip = null;
    state.previewHtml = '';

    resetUndoState();
    resetFileUpload();
    hideFindReplaceSection();
    renderEmptyState();
    hideMatchInfo();
    resetReplacementList(handleInputChange);
    setButtonStates({ canReplace: false, canUndo: false, canDownload: false });
}

// ── Preview & Matching ─────────────────────────────────────────

/**
 * Called whenever find/replace inputs or options change.
 * Updates the preview with highlighted matches.
 */
function handleInputChange() {
    if (!state.currentFile) {
        return;
    }

    const pairs = getPairs();
    const options = getOptions();
    const hasPatterns = pairs.length > 0;

    // Use the first pair's pattern for live preview highlighting
    const firstPattern = hasPatterns ? pairs[0].find : '';

    let matchCount = 0;

    if (state.fileType === 'txt') {
        matchCount = renderTextPreview(state.currentText, firstPattern, options);
    } else {
        matchCount = renderHtmlPreview(state.previewHtml, firstPattern, options);
    }

    updateMatchCount(matchCount);
    setButtonStates({
        canReplace: hasPatterns && matchCount > 0,
        canUndo: state.hasReplaced,
        canDownload: state.hasReplaced,
    });
}

// ── Replace All ────────────────────────────────────────────────

/**
 * Applies all replacement pairs to the document.
 */
async function handleReplaceAll() {
    try {
        const pairs = getPairs();
        const options = getOptions();

        if (pairs.length === 0) {
            return;
        }

        // Save undo state
        state.undoText = state.currentText;
        state.undoZip = state.currentZip;

        if (state.fileType === 'txt') {
            await applyTextReplacements(pairs, options);
        } else {
            await applyDocxReplacements(pairs, options);
        }

        state.hasReplaced = true;
        handleInputChange();

        const totalPairs = pairs.length;
        showToast(`Replaced ${totalPairs} pattern${totalPairs > 1 ? 's' : ''} successfully!`, 'success');
    } catch (error) {
        console.error('Error during replacement:', error);
        showToast('Replacement failed. Please try again.', 'error');
    }
}

/**
 * Applies replacements to a .txt document.
 *
 * @param {Array<{ find: string, replace: string }>} pairs - Replacement pairs.
 * @param {object} options - Replace options.
 */
async function applyTextReplacements(pairs, options) {
    let text = state.currentText;

    for (const pair of pairs) {
        text = replaceAll(text, pair.find, pair.replace, options);
    }

    state.currentText = text;
}

/**
 * Applies replacements to a .docx document.
 *
 * @param {Array<{ find: string, replace: string }>} pairs - Replacement pairs.
 * @param {object} options - Replace options.
 */
async function applyDocxReplacements(pairs, options) {
    // Reload the current zip from the file to get a fresh copy
    let zip = state.currentZip;

    for (const pair of pairs) {
        zip = await replaceInDocx(zip, pair.find, pair.replace, options);
    }

    state.currentZip = zip;

    // Regenerate preview from modified zip
    const blob = await exportDocx(zip);
    const arrayBuffer = await blob.arrayBuffer();
    state.previewHtml = await generateHtmlPreview(arrayBuffer);

    // Update text for matching
    const xml = await getDocumentXml(zip);
    state.currentText = extractTextFromXml(xml);
}

// ── Undo ───────────────────────────────────────────────────────

/**
 * Reverts the last replacement operation.
 */
async function handleUndo() {
    if (!state.hasReplaced) {
        return;
    }

    state.currentText = state.undoText || state.originalText;
    state.currentZip = state.undoZip || state.originalZip;

    if (state.fileType === 'docx' && state.currentZip) {
        const blob = await exportDocx(state.currentZip);
        const arrayBuffer = await blob.arrayBuffer();
        state.previewHtml = await generateHtmlPreview(arrayBuffer);
    }

    resetUndoState();
    handleInputChange();
    showToast('Undo successful!', 'success');
}

/**
 * Resets the undo state.
 */
function resetUndoState() {
    state.undoText = null;
    state.undoZip = null;
    state.hasReplaced = false;
}

// ── Download ───────────────────────────────────────────────────

/**
 * Downloads the modified document.
 */
async function handleDownload() {
    try {
        const originalName = state.currentFile.name;
        const dotIndex = originalName.lastIndexOf('.');
        const baseName = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
        const extension = dotIndex > 0 ? originalName.slice(dotIndex) : '';
        const downloadName = `${baseName}_replaced${extension}`;

        let blob;

        if (state.fileType === 'txt') {
            blob = exportTxt(state.currentText);
        } else {
            blob = await exportDocx(state.currentZip);
        }

        downloadFile(blob, downloadName);
        showToast('Download started!', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showToast('Download failed. Please try again.', 'error');
    }
}

// ── Toast ──────────────────────────────────────────────────────

/** @type {number|null} - Active toast timeout */
let toastTimeout = null;

/**
 * Shows a toast notification.
 *
 * @param {string} message - Message text.
 * @param {'success'|'error'|'warning'} [type='success'] - Toast type.
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('status-toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    toast.hidden = false;

    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.hidden = true;
        }, 300);
    }, 3000);
}
