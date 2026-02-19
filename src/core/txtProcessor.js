/**
 * @module txtProcessor
 * Plain text file reading, replacing, and exporting.
 */

/**
 * Reads a .txt File object as a UTF-8 string.
 *
 * @param {File} file - The text file to read.
 * @returns {Promise<string>} The file content as a string.
 */
export function loadTxt(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read text file.'));
        reader.readAsText(file, 'UTF-8');
    });
}

/**
 * Exports a text string as a downloadable Blob.
 *
 * @param {string} text - The text content.
 * @returns {Blob} A Blob of type text/plain.
 */
export function exportTxt(text) {
    return new Blob([text], { type: 'text/plain;charset=utf-8' });
}
