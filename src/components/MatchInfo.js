/**
 * @module MatchInfo
 * Displays the match count badge in the preview header.
 */

/**
 * Updates the match count display.
 *
 * @param {number} count - Number of matches found.
 */
export function updateMatchCount(count) {
    const badge = document.getElementById('match-info');
    const countEl = document.getElementById('match-count');

    if (count > 0) {
        badge.hidden = false;
        countEl.textContent = count;
    } else {
        badge.hidden = true;
        countEl.textContent = '0';
    }
}

/**
 * Hides the match info badge.
 */
export function hideMatchInfo() {
    const badge = document.getElementById('match-info');
    badge.hidden = true;
}
