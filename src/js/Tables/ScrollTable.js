import BaseTable from './BaseTable';

class ScrollTable extends BaseTable {
	/**
	 * Initialises an `o-table` component with "scroll" responsive behaviour.
	 *
	 * @access public
	 * @param {HTMLElement} rootEl - The `o-table` element.
	 * @param {TableSorter} sorter
	 * @param {Object} opts [{}]
	 * @param {Bool} opts.sortable [true]
	 * @returns {ScrollTable}
	 */
	constructor(rootEl, sorter, opts = {}) {
		super(rootEl, sorter, opts);
		this._duplicateRowsWithAddedHeader(); // Duplicate rows before adding heading sort buttons.
		window.setTimeout(this.addSortButtons.bind(this), 0);
		window.setTimeout(this._ready.bind(this), 0);
		return this;
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
		// Filter columns by rows (mobile view).
		const rowHeadingRows = Array.from(this.tbody.querySelectorAll('.o-table__duplicate-row'));
		const filterableCells = (rowHeadingRows.length ? rowHeadingRows[headerIndex].querySelectorAll('td') : []);
		filterableCells.forEach((cell, index) => {
			const showColumn = BaseTable._filterMatch(cell, filter);
			rowHeadingRows.forEach(row => {
				const hideCell = filter && !showColumn;
				const cell = row.querySelector(`td:nth-of-type(${index + 1})`);
				cell.setAttribute('data-o-table-filtered', hideCell);
				cell.setAttribute('aria-hidden', hideCell);
			});
		});

		// Filter rows by columns (desktop view).
		this._filterRowsByColumn(headerIndex, filter);
	}

	/**
	 * Duplicate the table headers into a one tbody row.
	 * @returns {undefined}
	 */
	_duplicateRowsWithAddedHeader() {
		// Clone headings and data into new rows.
		const clonedRows = this.tableHeaders.map((header, index) => {
			const headerRow = document.createElement('tr');
			headerRow.classList.add('o-table__duplicate-row');
			// Clone column heading and turn into a row heading.
			const clonedHeader = header.cloneNode(true);
			clonedHeader.setAttribute('scope', 'row');
			clonedHeader.setAttribute('role', 'rowheader');
			headerRow.appendChild(clonedHeader);
			// Clone data for the column into the new row.
			this.tableRows.forEach(row => {
				const data = row.querySelectorAll('td')[index];
				headerRow.appendChild(data.cloneNode(true));
			});
			return headerRow;
		});

		// Add new rows, which have a row rather than column headings, to the table body.
		window.requestAnimationFrame(function () {
			if (this.tbody.append) {
				this.tbody.append(...clonedRows);
			} else {
				clonedRows.forEach(row => this.tbody.appendChild(row));
			}
		}.bind(this));
	}
}

export default ScrollTable;
