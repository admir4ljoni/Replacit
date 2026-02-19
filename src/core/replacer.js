/**
 * @module replacer
 * Core find-and-replace engine.
 * Pure functions — no DOM, no side effects.
 */

/**
 * Builds a RegExp from the user's search pattern and options.
 *
 * @param {string} pattern - The search pattern (literal or regex).
 * @param {object} options
 * @param {boolean} options.isCaseSensitive - Match case exactly.
 * @param {boolean} options.isWholeWord - Match whole words only.
 * @param {boolean} options.isRegex - Treat pattern as regex.
 * @returns {RegExp} Compiled regular expression with global flag.
 */
export function buildRegex(pattern, { isCaseSensitive = false, isWholeWord = false, isRegex = false } = {}) {
    if (!pattern) {
        return null;
    }

    let source = isRegex ? pattern : escapeRegexChars(pattern);

    if (isWholeWord) {
        source = `\\b${source}\\b`;
    }

    const flags = isCaseSensitive ? 'g' : 'gi';
    return new RegExp(source, flags);
}

/**
 * Escapes special regex characters in a literal string.
 *
 * @param {string} str - The literal string to escape.
 * @returns {string} Escaped string safe for use in a RegExp constructor.
 */
export function escapeRegexChars(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Finds all matches of a pattern in the given text.
 *
 * @param {string} text - The text to search in.
 * @param {string} pattern - The search pattern.
 * @param {object} options - See buildRegex for option details.
 * @returns {{ count: number, positions: Array<{ start: number, end: number, match: string }> }}
 */
export function findMatches(text, pattern, options = {}) {
    const regex = buildRegex(pattern, options);

    if (!regex) {
        return { count: 0, positions: [] };
    }

    const positions = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        positions.push({
            start: match.index,
            end: match.index + match[0].length,
            match: match[0],
        });

        // Prevent infinite loops on zero-length matches
        if (match[0].length === 0) {
            regex.lastIndex++;
        }
    }

    return { count: positions.length, positions };
}

/**
 * Replaces all occurrences of a pattern in the given text.
 *
 * @param {string} text - The source text.
 * @param {string} pattern - The search pattern.
 * @param {string} replacement - The replacement string.
 * @param {object} options - See buildRegex for option details.
 * @returns {string} The text with all matches replaced.
 */
export function replaceAll(text, pattern, replacement, options = {}) {
    const regex = buildRegex(pattern, options);

    if (!regex) {
        return text;
    }

    return text.replace(regex, replacement);
}
