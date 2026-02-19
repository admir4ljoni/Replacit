/**
 * @module ReplacementList
 * Manages multiple find/replace input pairs.
 */

let pairCount = 0;

/**
 * Creates the HTML for a single replacement pair.
 *
 * @param {number} index - The pair index.
 * @returns {string} HTML string for the pair.
 */
function createPairHtml(index) {
    return `
    <div class="replacement-pair" data-pair-index="${index}">
      <div class="pair-header">
        <span>Pair #${index + 1}</span>
        ${index > 0 ? `<button type="button" class="btn-icon remove-pair-btn" data-pair-index="${index}" aria-label="Remove pair"><i class="icon-x"></i></button>` : ''}
      </div>
      <input type="text" class="find-input" data-pair-index="${index}" placeholder="Find..." aria-label="Find text" />
      <input type="text" class="replace-input" data-pair-index="${index}" placeholder="Replace with..." aria-label="Replace with text" />
    </div>
  `;
}

/**
 * Initializes the replacement list with one pair and sets up the "add" button.
 *
 * @param {object} callbacks
 * @param {function(): void} callbacks.onInputChange - Called when any find/replace input changes.
 */
export function initReplacementList({ onInputChange }) {
    const container = document.getElementById('replacement-list');
    const addBtn = document.getElementById('add-pair-btn');

    // Add the first pair
    addPair(container, onInputChange);

    addBtn.addEventListener('click', () => {
        addPair(container, onInputChange);
    });
}

/**
 * Adds a new pair to the list.
 *
 * @param {HTMLElement} container - The replacement list container.
 * @param {function(): void} onInputChange - Input change callback.
 */
function addPair(container, onInputChange) {
    const index = pairCount++;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = createPairHtml(index);
    const pairEl = wrapper.firstElementChild;
    container.appendChild(pairEl);

    // Listen for input changes
    pairEl.querySelectorAll('input').forEach((input) => {
        input.addEventListener('input', onInputChange);
    });

    // Listen for remove
    const removeBtn = pairEl.querySelector('.remove-pair-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            pairEl.remove();
            onInputChange();
        });
    }
}

/**
 * Reads all find/replace pairs currently in the DOM.
 *
 * @returns {Array<{ find: string, replace: string }>} List of pairs with non-empty find values.
 */
export function getPairs() {
    const pairs = [];
    const pairEls = document.querySelectorAll('.replacement-pair');

    pairEls.forEach((el) => {
        const findVal = el.querySelector('.find-input').value;
        const replaceVal = el.querySelector('.replace-input').value;

        if (findVal.trim()) {
            pairs.push({ find: findVal, replace: replaceVal });
        }
    });

    return pairs;
}

/**
 * Resets the replacement list to a single empty pair.
 *
 * @param {function(): void} onInputChange - Input change callback.
 */
export function resetReplacementList(onInputChange) {
    const container = document.getElementById('replacement-list');
    container.innerHTML = '';
    pairCount = 0;
    addPair(container, onInputChange);
}
