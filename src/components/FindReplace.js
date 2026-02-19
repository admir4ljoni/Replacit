/**
 * @module FindReplace
 * Manages the find/replace section visibility and action buttons.
 */

/**
 * Shows the find/replace section.
 */
export function showFindReplaceSection() {
    const section = document.getElementById('find-replace-section');
    section.hidden = false;
}

/**
 * Hides the find/replace section.
 */
export function hideFindReplaceSection() {
    const section = document.getElementById('find-replace-section');
    section.hidden = true;
}

/**
 * Reads the current option toggle states.
 *
 * @returns {{ isCaseSensitive: boolean, isWholeWord: boolean, isRegex: boolean }}
 */
export function getOptions() {
    return {
        isCaseSensitive: document.getElementById('opt-case-sensitive').checked,
        isWholeWord: document.getElementById('opt-whole-word').checked,
        isRegex: document.getElementById('opt-regex').checked,
    };
}

/**
 * Enables or disables action buttons.
 *
 * @param {object} states
 * @param {boolean} states.canReplace - Enable the Replace All button.
 * @param {boolean} states.canUndo - Enable the Undo button.
 * @param {boolean} states.canDownload - Enable the Download button.
 */
export function setButtonStates({ canReplace = false, canUndo = false, canDownload = false }) {
    document.getElementById('btn-replace-all').disabled = !canReplace;
    document.getElementById('btn-undo').disabled = !canUndo;
    document.getElementById('btn-download').disabled = !canDownload;
}

/**
 * Initializes event listeners for action buttons and option toggles.
 *
 * @param {object} callbacks
 * @param {function(): void} callbacks.onReplaceAll
 * @param {function(): void} callbacks.onUndo
 * @param {function(): void} callbacks.onDownload
 * @param {function(): void} callbacks.onOptionsChange - Called when any option toggle changes.
 */
export function initFindReplace({ onReplaceAll, onUndo, onDownload, onOptionsChange }) {
    document.getElementById('btn-replace-all').addEventListener('click', onReplaceAll);
    document.getElementById('btn-undo').addEventListener('click', onUndo);
    document.getElementById('btn-download').addEventListener('click', onDownload);

    const optionInputs = ['opt-case-sensitive', 'opt-whole-word', 'opt-regex'];
    optionInputs.forEach((id) => {
        document.getElementById(id).addEventListener('change', onOptionsChange);
    });
}
