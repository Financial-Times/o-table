class BaseTable {
	/**
	 * Initialises o-table component(s).
	 *
	 * @param {(HTMLElement|string)} [el=document.body] - o-table element, or element where to search for an o-table element to initialise. You can pass an HTMLElement or a selector string
	 * @returns {OTable} - A single OTable instance
	 */
	constructor(rootEl, sorter) {
		this._listeners = [];
		this._sorter = sorter;
		this.rootEl = rootEl;
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
	 * @public
	 * @returns {element|null} - The header element for the requested column index.
	 */
	getTableHeader(columnIndex) {
		return this.tableHeaders[columnIndex] || null;
	}

	/**
	 * Indicates that the table has been sorted.
	 *
	 * @public
	 * @param {number|null} columnIndex - The index of the currently sorted column, if any.
	 * @param {string|null} sortOrder - The type of sort i.e. ascending or descending, if any.
	 */
	sorted({ columnIndex, sortOrder }) {
		this._dispatchEvent('sorted', {
			sortOrder,
			columnIndex
		});
	}

	/**
	 * Destroys the instance, removing any event listeners that were added during instatiation of the component
	 * @returns undefined
	 */
	destroy() {
		this._listeners.forEach(({ type, listener, element }) => {
			element.removeEventListener(type, listener);
		});
		try {
			delete this.rootEl;
			delete this.wrapper;
			delete this.container;
		} catch (error) {
			// Elements never existed or are already deleted.
		}
	}

	_ready() {
		this._dispatchEvent('ready');
	}

	_addSortButtons() {
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

	_toggleColumnSort(th, columnIndex) {
		const currentSort = th.getAttribute('aria-sort');
		const sortOrder = [null, 'none', 'descending'].includes(currentSort) ? 'ascending' : 'descending';
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
	 * Helper function to dispatch namespaced events, namespace defaults to oTable
	 * @param  {String} event
	 * @param  {Object} data={}
	 * @param  {Object} opts={}
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
