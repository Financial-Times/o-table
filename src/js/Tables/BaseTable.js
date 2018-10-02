class BaseTable {

	/**
	 * The shared functionality of all `o-table` variants.
	 *
	 * @access public
	 * @param {HTMLElement} rootEl - The `o-table` element.
	 * @param {TableSorter} sorter
	 * @param {Object} opts [{}]
	 * @param {Bool} opts.sortable [true]
	 * @returns {BaseTable}
	 */
	constructor(rootEl, sorter, opts = {}) {
		this._listeners = [];
		this._sorter = sorter;
		this.rootEl = rootEl;
		this._opts = Object.assign({
			sortable: this.rootEl.getAttribute('data-o-table-sortable') !== 'false'
		}, opts);
		this.thead = this.rootEl.querySelector('thead');
		this.tbody = this.rootEl.querySelector('tbody');
		this.tableHeaders = this.thead ? Array.from(this.thead.querySelectorAll('th')) : [];
		this.tableRows = this.tbody ? Array.from(this.tbody.getElementsByTagName('tr')) : [];
		this.wrapper = this.rootEl.closest('.o-table-wrapper');
		this.container = this.rootEl.closest('.o-table-container');
	}

	/**
	 * Gets a table header for a given column index.
	 *
	 * @access public
	 * @param {Number} columnIndex - The index of the table column to get the header for.
	 * @throws When no header is not found.
	 * @returns {HTMLElement}
	 */
	getTableHeader(columnIndex) {
		const th = this.tableHeaders[columnIndex];
		if (!th) {
			throw new Error(`Could not find header for column index "${columnIndex}".`);
		}
		return th;
	}

	/**
	 * Sort the table.
	 *
	 * @access public
	 * @param {Number} columnIndex - The index of the table column to sort.
	 * @param {Number} sortOrder - How to sort the column, "ascending" or "descending"
	 * @returns {undefined}
	 */
	sortRowsByColumn(columnIndex, sortOrder) {
		/**
		 * Fires an "oTable.sorting" event. The sorting event can be cancelled to
		 * provide a totally custom method of sorting the table.
		 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
		 */
		const defaultSort = this._dispatchEvent('sorting', {
			sort: sortOrder,
			columnIndex
		}, { cancelable: true });

		if (defaultSort) {
			this._sorter.sortRowsByColumn(this, columnIndex, sortOrder);
		}
	}

	/**
	 * Add sort buttons to the DOM within the table header.
	 * @returns {undefined}
	 */
	addSortButtons() {
		if (!this._opts.sortable) {
			return;
		}
		this.tableHeaders.forEach(function (th, columnIndex) {
			// Don't add sort buttons to unsortable columns.
			if (th.hasAttribute('data-o-table-heading-disable-sort')) {
				return;
			}
			// Move heading text into button.
			const sortButton = document.createElement('button');
			const heading = th.textContent;
			sortButton.textContent = heading;
			// In VoiceOver, button `aria-label` is repeated when moving from one column of tds to the next.
			// Using `title` avoids this, but risks not being announced by other screen readers.
			sortButton.classList.add('o-table__sort');
			sortButton.setAttribute('title', `sort table by ${heading}`);
			th.innerHTML = '';
			th.appendChild(sortButton);
			// Add click event to button.
			const listener = this._toggleColumnSort.bind(this, th, columnIndex);
			sortButton.addEventListener('click', listener);
			this._listeners.push({
				element: sortButton,
				listener,
				type: 'click'
			});
		}.bind(this));
	}

	/**
	 * Indicate that the table has been sorted after intercepting the sorting event.
	 *
	 * @access public
	 * @param {Object} sortDetails - Details of the current sort state.
	 * @param {Number|Null} sortDetails.columnIndex - The index of the currently sorted column.
	 * @param {String|Null} sortDetails.sortOrder - The type of sort, "ascending" or "descending"
	 */
	sorted({ columnIndex, sortOrder }) {
		if (isNaN(columnIndex)) {
			throw new Error(`Expected a numerical column index but received "${columnIndex}".`);
		}
		if (!sortOrder) {
			throw new Error(`Expected a sort order e.g. "ascending" or "descending".`);
		}
		this._dispatchEvent('sorted', {
			sortOrder,
			columnIndex
		});
	}

	/**
	 * Gets the instance ready for deletion.
	 * Removes event listeners that were added during instatiation of the component.
	 * @access public
	 * @returns {undefined}
	 */
	destroy() {
		this._listeners.forEach(({ type, listener, element }) => {
			element.removeEventListener(type, listener);
		});
	}

	/**
	 * Indicate that the table has been constructed successfully.
	 * @returns {undefined}
	 */
	_ready() {
		this._dispatchEvent('ready');
	}

	/**
	 * @param {HTMLElement} th - The table header element for the column to sort by.
	 * @param {Number} columnIndex - The index of the column to sort by.
	 * @returns {undefined}
	 */
	_toggleColumnSort(th, columnIndex) {
		const currentSort = th.getAttribute('aria-sort');
		const sortOrder = [null, 'none', 'descending'].indexOf(currentSort) !== -1 ? 'ascending' : 'descending';
		this.sortRowsByColumn(columnIndex, sortOrder);
	}

	/**
	 * Helper function to dispatch namespaced events.
	 *
	 * @param {String} event - The event name within `oTable` e.g. "sorted".
	 * @param {Object} data={} - Event data. `insatnce` is added automatically.
	 * @param {Object} opts={} - [Event options]{@link https://developer.mozilla.org/en-US/docs/Web/API/Event/Event#Values} (o-table events bubble by default).
	 */
	_dispatchEvent(event, data = {}, opts = {}) {
		Object.assign(data , {
			instance: this
		});
		return this.rootEl.dispatchEvent(new CustomEvent(`oTable.${event}`, Object.assign({
			detail: data,
			bubbles: true
		}, opts)));
	}
}

export default BaseTable;
