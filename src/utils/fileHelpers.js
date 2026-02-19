/**
 * @module fileHelpers
 * Utility functions for file type detection and validation.
 */

/** Supported file extensions */
export const SUPPORTED_EXTENSIONS = ['.docx', '.txt'];

/** Maximum file size in MB */
export const MAX_FILE_SIZE_MB = 50;

/**
 * Extracts the file extension (lowercased, with dot).
 *
 * @param {File} file - The file to inspect.
 * @returns {string} Extension string, e.g. '.docx'.
 */
export function getFileExtension(file) {
    const name = file.name || '';
    const dotIndex = name.lastIndexOf('.');
    if (dotIndex === -1) {
        return '';
    }
    return name.slice(dotIndex).toLowerCase();
}

/**
 * Checks whether a file has a supported extension.
 *
 * @param {File} file - The file to validate.
 * @returns {boolean} True if the extension is supported.
 */
export function isSupported(file) {
    return SUPPORTED_EXTENSIONS.includes(getFileExtension(file));
}

/**
 * Checks whether a file is within the allowed size limit.
 *
 * @param {File} file - The file to check.
 * @returns {boolean} True if under the size limit.
 */
export function isWithinSizeLimit(file) {
    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    return file.size <= maxBytes;
}

/**
 * Returns a human-readable file size string.
 *
 * @param {number} bytes - File size in bytes.
 * @returns {string} Formatted size, e.g. '2.4 MB'.
 */
export function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
