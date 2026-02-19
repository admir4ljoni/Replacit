/**
 * @module FileUpload
 * Manages the drag-and-drop upload zone and file input.
 */

import { isSupported, isWithinSizeLimit, MAX_FILE_SIZE_MB } from '../utils/fileHelpers.js';

/**
 * Initializes the file upload component.
 * Sets up drag-and-drop listeners and file input change handler.
 *
 * @param {object} callbacks
 * @param {function(File): void} callbacks.onFileSelected - Called when a valid file is selected.
 * @param {function(string): void} callbacks.onError - Called with an error message.
 */
export function initFileUpload({ onFileSelected, onError }) {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');

    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            handleFile(file, onFileSelected, onError);
        }
    });

    // Drag-and-drop
    uploadZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadZone.classList.remove('drag-over');
        const file = event.dataTransfer.files[0];
        if (file) {
            handleFile(file, onFileSelected, onError);
        }
    });
}

/**
 * Validates and processes the selected file.
 *
 * @param {File} file - The file to validate.
 * @param {function(File): void} onFileSelected - Success callback.
 * @param {function(string): void} onError - Error callback.
 */
function handleFile(file, onFileSelected, onError) {
    if (!isSupported(file)) {
        onError('Unsupported file type. Please upload a .docx or .txt file.');
        return;
    }

    if (!isWithinSizeLimit(file)) {
        onError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
        return;
    }

    onFileSelected(file);
}

/**
 * Updates the UI to show the uploaded file's name.
 *
 * @param {string} fileName - The name of the uploaded file.
 */
export function showFileInfo(fileName) {
    const uploadZone = document.getElementById('upload-zone');
    const fileInfo = document.getElementById('file-info');
    const fileNameEl = document.getElementById('file-name');

    uploadZone.classList.add('has-file');
    fileInfo.hidden = false;
    fileNameEl.textContent = fileName;
}

/**
 * Resets the upload zone to its initial empty state.
 */
export function resetFileUpload() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInfo = document.getElementById('file-info');
    const fileInput = document.getElementById('file-input');

    uploadZone.classList.remove('has-file');
    fileInfo.hidden = true;
    fileInput.value = '';
}
