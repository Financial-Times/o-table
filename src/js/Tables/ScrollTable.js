import BaseTable from './BaseTable';

class ScrollTable extends BaseTable {

	/**
	 * Initialises a "scroll" o-table component.
	 *
	 * @param {HTMLElement} - o-table element
	 * @returns {ScrollTable} - A single OTable instance
	 */
	constructor(rootEl, sorter) {
		super(rootEl, sorter);
		this._duplicateRowsWithAddedHeader();
		this._addSortButtons();
		this._ready();
		return this;
	}

	/**
	 * Duplicate the table headers into each row
	 * For use with responsive tables
	 *
	 * @private
	 */
	_duplicateRowsWithAddedHeader() {
		this.tableHeaders.forEach((header, index) => {
			const headerRow = document.createElement('tr');
			headerRow.classList.add('o-table__duplicate-row');
			header.setAttribute('scope', 'row');
			headerRow.appendChild(header.cloneNode(true));
			this.tableRows.forEach(row => {
				const data = row.querySelectorAll('td')[index];
				headerRow.appendChild(data.cloneNode(true));
			});
			this.tbody.appendChild(headerRow);
		});
	}
}

export default ScrollTable;