import Delegate from 'dom-delegate';

/**
 * Append rows to table.
 *
 * @access private
 * @param {Element} tbody - The table body to append the row batch to.
 * @param {Array} rowBatch - An array of rows to append to the table body.
 * @returns {undefined}
 */
function append(tbody, rowBatch) {
	if (tbody.append) {
		tbody.append(...rowBatch);
	} else {
		rowBatch.forEach(row => tbody.appendChild(row));
	}
}

/**
 * Prepend rows to table.
 *
 * @access private
 * @param {Element} tbody - The table body to prepend the row batch to.
 * @param {Array} rowBatch - An array of rows to prepend to the table body.
 * @returns {undefined}
 */
function prepend(tbody, rowBatch) {
	if (tbody.prepend) {
		tbody.prepend(...rowBatch);
	} else {
		rowBatch.reverse().forEach(row => {
			tbody.insertBefore(row, tbody.firstChild);
		});
	}
}

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
		this.wrapper = this.rootEl.closest('.o-table-scroll-wrapper');
		this.container = this.rootEl.closest('.o-table-container');
		this.overlayWrapper = this.rootEl.closest('.o-table-overlay-wrapper');
		this._rootElDomDelegate = new Delegate(this.rootEl);
		this._setupFilterElements();
	}

	_setupFilterElements() {
		const tableId = this.rootEl.getAttribute('id');
		if (!tableId) {
			return;
		}
		// Do nothing if no filter is found for this table.
		const filter = window.document.querySelector(`[data-o-table-filter-id="${tableId}"]`);
		if (!filter) {
			return;
		}
		// Warn if a misconfigured filter was found.
		const filterColumn = parseInt(filter.getAttribute('data-o-table-filter-column'), 10);
		if (!filterColumn) {
			console.warn(`Could not setup the filter for the table "${tableId}" as no column index was given to filter on. Add a \`data-o-table-filter-column="{columnIndex}"\` attribute to the filter.`, filter);
			return;
		}
		// Apply the filter .
		if (filter.value) {
			this.filter(filterColumn, filter.value);
		}
		// Add a listener to filter the table.
		filter.addEventListener('input', (event) => {
			this.filter(filterColumn, event.target.value || '');
		});
	}

	/**
	 * Render table rows.
	 *
	 * @access private
	 * @returns {undefined}
	 */
	renderRows() {
		const batch = this._renderRowsBatchNumber;
		const rows = this.tableRows.slice(0);

		// Ensure the correct aria-hidden attribute
		// based on the tables current state.
		this._updateRowVisibility();

		// Render filtered rows at the end of the table,
		// to maintain the striped table style.
		rows.sort((a, b) => {
			const aHidden = a.getAttribute('data-o-table-filtered') === 'true';
			const bHidden = b.getAttribute('data-o-table-filtered') === 'true';
			if (aHidden && !bHidden) {
				return 1;
			}
			if (!aHidden && bHidden) {
				return -1;
			}
			return 0;
		});

		// Render table rows in batches.
		let updatedRowCount = 0;
		const updateSortedRowBatch = function() {
			window.requestAnimationFrame(() => {
				if (updatedRowCount === 0 && isNaN(batch) === false) {
					// On first run, update a batch of rows.
					const rowBatch = rows.slice(updatedRowCount, batch);
					prepend(this.tbody, rowBatch);
					updatedRowCount = updatedRowCount + batch;
				} else {
					// On second run, update all the rest.
					const rowBatch = rows.slice(updatedRowCount);
					append(this.tbody, rowBatch);
					updatedRowCount = rows.length;
				}
				if (updatedRowCount < rows.length) {
					updateSortedRowBatch();
				}
			});
		}.bind(this);
		updateSortedRowBatch();
	}

	/**
	 * Filter the table.
	 *
	 * @access public
	 * @param {Number} headerIndex - The index of the table column to filter.
	 * @param {String|Function} filter - How to filter the column (either a string to match or a callback function).
	 * @returns {undefined}
	 */
	filter(headerIndex, filter) {
		this._filterRowsByColumn(headerIndex, filter);
		this.renderRows();
	}

	/**
	 * Filter the table.
	 *
	 * @access public
	 * @param {Number} columnIndex - The index of the table column to filter.
	 * @param {String|Function} filter - How to filter the column (either a string to match or a callback function).
	 * @returns {undefined}
	 */
	_filterRowsByColumn(columnIndex, filter) {
		if (typeof filter !== 'string' && typeof filter !== 'function') {
			throw new Error(`Could not filter table column "${columnIndex}". Expected the filter to a string or function.`, this);
		}

		// Filter column headings.
		this.tableRows.forEach(row => {
			const cell = row.querySelector(`td:nth-of-type(${columnIndex + 1})`);
			if(cell) {
				const hideRow = this._filterMatch(cell, filter);
				row.setAttribute('data-o-table-filtered', hideRow);
			}
		});
	}

	/**
	 * Filter the table.
	 *
	 * @access public
	 * @param {Element} cell - The table cell to test the filter function against.
	 * @param {String|Function} filter - The filter, either a string or callback function.
	 * @returns {Boolean}
	 */
	_filterMatch(cell, filter) {
		// If the filter is a string create a filter function which:
		// - Always matches an emtpy string (no filter).
		// - Matches against only alpha numeric characters and ".".
		// - Case insentivie.
		// - Whitespace insentivie.
		if (typeof filter === 'string') {
			const filterValue = filter.replace(/[^\w\.]+/g, '').toLowerCase();
			filter = (cell) => {
				const cellValue = cell.textContent.replace(/[^\w\.]+/g, '').toLowerCase();
				return filterValue ? cellValue.indexOf(filterValue) > -1 : true;
			};
		}

		// Check if the filter matches the given table cell.
		return filter(cell.cloneNode(true)) !== true;
	}

	/**
	 * Which rows are hidden by a filter.
	 * @returns {Array[Node]}
	 */
	get _rowsHiddenByFilter() {
		const hiddenByFilter = this.tableRows.filter(row => row.getAttribute('data-o-table-filtered') === 'true');
		return hiddenByFilter;
	}

	/**
	 * Which rows are hidden, e.g. by a filter.
	 * @returns {Array[Node]}
	 */
	get _rowsToHide() {
		const hiddenByFilter = this._rowsHiddenByFilter;
		return hiddenByFilter;
	}

	/**
	 * Update row aria attributes to show/hide them.
	 * E.g. After performing a sort or filter, rows which where hidden in the colapsed table may have become visible.
	 * @returns {undefined}
	 */
	_updateRowVisibility() {
		const rowsToHide = this._rowsToHide || [];
		window.requestAnimationFrame(function () {
			this.tableRows.forEach((row) => {
				const hide = rowsToHide.indexOf(row) !== -1;
				row.setAttribute('aria-hidden', hide ? 'true' : 'false');
			});
		}.bind(this));
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
			this._sorter.sortRowsByColumn(this, columnIndex, sortOrder, this._renderRowsBatchNumber);
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

		// Create buttons for each table header.
		const tableHeaderButtons = this.tableHeaders.map((th) => {
			// Don't add sort buttons to unsortable columns.
			if (th.hasAttribute('data-o-table-heading-disable-sort')) {
				return null;
			}
			// Don't add sort buttons to columns with no headings.
			if (!th.hasChildNodes()) {
				return null;
			}
			// Move heading text into button.
			const headingNodes = Array.from(th.childNodes);
			const headingHTML = headingNodes.reduce((html, node) => {
				// Maintain child elements of the heading which make sense in a button.
				const maintainedElements = ['ABBR', 'B', 'BDI', 'BDO', 'BR', 'CODE', 'CITE', 'DATA', 'DFN', 'DEL', 'EM', 'I', 'S', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TIME', 'U', 'VAR', 'WBR'];
				if (node.nodeType === Node.ELEMENT_NODE && maintainedElements.includes(node.nodeName)) {
					return html + node.outerHTML;
				}
				// Otherwise return text content.
				if (node.nodeType === Node.ELEMENT_NODE) {
					console.warn(`o-table has removed the element "${node.nodeName}" from the table heading to add a sort button on the column. Please remove this element from your table heading, disable sort on this column, or contact the Origami team for help.`, th);
				}
				return html + node.textContent;
			}, '');

			const sortButton = document.createElement('button');
			sortButton.innerHTML = headingHTML;
			sortButton.classList.add('o-table__sort');
			// In VoiceOver, button `aria-label` is repeated when moving from one column of tds to the next.
			// Using `title` avoids this, but risks not being announced by other screen readers.
			sortButton.setAttribute('title', `sort table by ${th.textContent}`);
			return sortButton;
		});

		// Add sort buttons to table headers.
		window.requestAnimationFrame(function (){
			this.rootEl.classList.add('o-table--sortable');
			this.tableHeaders.forEach((th, index) => {
				if (tableHeaderButtons[index]) {
					th.innerHTML = '';
					th.appendChild(tableHeaderButtons[index]);
				}
			});
		}.bind(this));

		// Add click event to buttons.
		const listener = this._sortButtonHandler.bind(this);
		this._rootElDomDelegate.on('click', '.o-table__sort', listener);
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
		this._rootElDomDelegate.destroy();
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
	 * Handles a sort button click event. Toggles column sort.
	 * @param {MouseEvent} event - The click event.
	 * @returns {undefined}
	 */
	_sortButtonHandler(event) {
		const sortButton = event.target;
		const th = sortButton.closest('th');
		const columnIndex = this.tableHeaders.indexOf(th);
		if (th && !isNaN(columnIndex)) {
			const currentSort = th.getAttribute('aria-sort');
			const sortOrder = [null, 'none', 'descending'].indexOf(currentSort) !== -1 ? 'ascending' : 'descending';
			this.sortRowsByColumn(columnIndex, sortOrder);
		}
	}

	/**
	 * Helper function to dispatch namespaced events.
	 *
	 * @param {String} event - The event name within `oTable` e.g. "sorted".
	 * @param {Object} data={} - Event data. `instance` is added automatically.
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
