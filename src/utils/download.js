/**
 * @module download
 * Wrapper around FileSaver.js for downloading files.
 */

import { saveAs } from 'file-saver';

/**
 * Triggers a browser download for a Blob with the given filename.
 *
 * @param {Blob} blob - The file content as a Blob.
 * @param {string} filename - The download filename.
 */
export function downloadFile(blob, filename) {
    saveAs(blob, filename);
}
