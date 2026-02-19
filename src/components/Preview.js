/**
 * @module Preview
 * Renders document content in the preview panel with match highlights.
 */

import { findMatches } from '../core/replacer.js';

/**
 * Renders raw text content into the preview panel, highlighting matches.
 *
 * @param {string} text - The document's plain text content.
 * @param {string} pattern - The search pattern to highlight.
 * @param {object} options - Replace options (isCaseSensitive, isWholeWord, isRegex).
 * @returns {number} The number of matches found.
 */
export function renderTextPreview(text, pattern, options = {}) {
    const previewEl = document.getElementById('preview-content');

    if (!text) {
        renderEmptyState();
        return 0;
    }

    if (!pattern || !pattern.trim()) {
        previewEl.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
        return 0;
    }

    const { count, positions } = findMatches(text, pattern, options);
    previewEl.innerHTML = buildHighlightedHtml(text, positions);
    return count;
}

/**
 * Renders HTML content (for .docx preview) with text-level match highlights.
 *
 * @param {string} html - The HTML string from Mammoth.
 * @param {string} pattern - The search pattern.
 * @param {object} options - Replace options.
 * @returns {number} The number of matches found in the text content.
 */
export function renderHtmlPreview(html, pattern, options = {}) {
    const previewEl = document.getElementById('preview-content');

    if (!html) {
        renderEmptyState();
        return 0;
    }

    if (!pattern || !pattern.trim()) {
        previewEl.innerHTML = html;
        return 0;
    }

    // Apply highlighting to the text nodes within the HTML
    const highlighted = highlightInHtml(html, pattern, options);
    previewEl.innerHTML = highlighted.html;
    return highlighted.count;
}

/**
 * Shows the empty state placeholder.
 */
export function renderEmptyState() {
    const previewEl = document.getElementById('preview-content');
    previewEl.innerHTML = `
    <div class="preview-empty">
      <i class="icon-eye"></i>
      <p>Upload a document to see a preview</p>
    </div>
  `;
}

/**
 * Builds an HTML string with <mark> tags around matched positions.
 *
 * @param {string} text - The original text.
 * @param {Array<{ start: number, end: number }>} positions - Match positions.
 * @returns {string} HTML string with highlights.
 */
function buildHighlightedHtml(text, positions) {
    if (positions.length === 0) {
        return escapeHtml(text).replace(/\n/g, '<br>');
    }

    let result = '';
    let lastIndex = 0;

    for (const pos of positions) {
        // Text before match
        result += escapeHtml(text.slice(lastIndex, pos.start)).replace(/\n/g, '<br>');
        // Highlighted match
        result += `<mark class="match-highlight">${escapeHtml(text.slice(pos.start, pos.end))}</mark>`;
        lastIndex = pos.end;
    }

    // Remaining text after last match
    result += escapeHtml(text.slice(lastIndex)).replace(/\n/g, '<br>');
    return result;
}

/**
 * Highlights matches within an HTML string by operating on text content only.
 * Uses a temporary DOM element to parse HTML and process text nodes.
 *
 * @param {string} html - The source HTML.
 * @param {string} pattern - The search pattern.
 * @param {object} options - Replace options.
 * @returns {{ html: string, count: number }} Highlighted HTML and match count.
 */
function highlightInHtml(html, pattern, options) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    let totalCount = 0;
    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    for (const node of textNodes) {
        const { count, positions } = findMatches(node.textContent, pattern, options);
        if (count > 0) {
            totalCount += count;
            const fragment = createHighlightFragment(node.textContent, positions);
            node.parentNode.replaceChild(fragment, node);
        }
    }

    return { html: tempDiv.innerHTML, count: totalCount };
}

/**
 * Creates a DocumentFragment with highlighted spans for the given positions.
 *
 * @param {string} text - The original text node content.
 * @param {Array<{ start: number, end: number }>} positions - Match positions.
 * @returns {DocumentFragment} Fragment with highlighted marks.
 */
function createHighlightFragment(text, positions) {
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    for (const pos of positions) {
        if (pos.start > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, pos.start)));
        }
        const mark = document.createElement('mark');
        mark.className = 'match-highlight';
        mark.textContent = text.slice(pos.start, pos.end);
        fragment.appendChild(mark);
        lastIndex = pos.end;
    }

    if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    return fragment;
}

/**
 * Escapes HTML special characters to prevent XSS in preview.
 *
 * @param {string} str - Raw string.
 * @returns {string} Escaped string.
 */
function escapeHtml(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, (char) => map[char]);
}
