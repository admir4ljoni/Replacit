/**
 * @module ThemeToggle
 * Dark/light mode toggle with localStorage persistence and system preference detection.
 */

const THEME_KEY = 'replacit-theme';

/**
 * Initializes the theme toggle.
 * Reads saved preference or system preference, applies it, and sets up the toggle button.
 */
export function initThemeToggle() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    applyTheme(initialTheme);

    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
    });
}

/**
 * Applies a theme to the document.
 *
 * @param {'dark' | 'light'} theme - The theme to apply.
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}
