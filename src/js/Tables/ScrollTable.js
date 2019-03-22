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
		this._tableHeadersWithoutSort = this.tableHeaders.map(header => header.cloneNode(true));
		this._duplicateRowsWithAddedHeader();
		window.setTimeout(this.addSortButtons.bind(this), 0);
		window.setTimeout(this.setupFilters.bind(this), 0);
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
		this._filterRowsByColumn(headerIndex, filter);

		// Filter rows by columns (desktop view).
		this.updateRows();

		// Filter columns by rows (mobile view).
		this._duplicateRowsWithAddedHeader();
	}

	/**
	 * Duplicate the table headers into a one tbody row.
	 * @returns {undefined}
	 */
	_duplicateRowsWithAddedHeader() {
		// Clone headings and data into new rows.
		const clonedRows = this._tableHeadersWithoutSort.map((header, index) => {
			const headerRow = document.createElement('tr');
			headerRow.classList.add('o-table__duplicate-row');
			// Clone column heading and turn into a row heading.
			const clonedHeader = header.cloneNode(true);
			clonedHeader.setAttribute('scope', 'row');
			clonedHeader.setAttribute('role', 'rowheader');
			headerRow.appendChild(clonedHeader);
			// Clone data for the column into the new row.
			this.tableRows.forEach(row => {
				const cell = row.querySelectorAll('td')[index];
				if (cell) {
					const cellClone = cell.cloneNode(true);
					const filteredData = this._filteredTableRows.includes(row);
					cellClone.setAttribute('data-o-table-filtered', filteredData);
					cellClone.setAttribute('aria-hidden', filteredData);
					headerRow.appendChild(cellClone);
				}
			});
			return headerRow;
		});

		// Add new rows, which have a row rather than column headings, to the table body.
		window.requestAnimationFrame(function () {
			const rowHeadingRows = Array.from(this.tbody.querySelectorAll('.o-table__duplicate-row'));
			rowHeadingRows.forEach(row => this.tbody.removeChild(row));
			if (this.tbody.prepend) {
				this.tbody.prepend(...clonedRows);
			} else {
				clonedRows.reverse().forEach(row => {
					this.tbody.insertBefore(row, this.tbody.firstChild);
				});
			}
		}.bind(this));
	}
}

export default ScrollTable;
