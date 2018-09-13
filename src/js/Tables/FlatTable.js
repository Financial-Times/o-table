import BaseTable from './BaseTable';

class FlatTable extends BaseTable {

	/**
	 * Initialises a "flat" o-table component.
	 *
	 * @param {HTMLElement} - o-table element
	 * @returns {FlatTable} - A single OTable instance
	 */
	constructor(rootEl, sorter) {
		super(rootEl, sorter);
		// Flat table can only work given headers.
		if (this.tableHeaders.length > 0) {
			this._duplicateHeaders(rootEl);
		} else {
			console.warn('Could create a "flat" table as no headers were found. Ensure table headers are placed within "<thead>". Removing class "o-table--responsive-flat".', rootEl);
			rootEl.classList.remove('o-table--responsive-flat');
		}
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
	_duplicateHeaders() {
		this.tableRows.forEach((row) => {
			const data = Array.from(row.getElementsByTagName('td'));
			data.forEach((td, dataIndex) => {
				const clonedHeader = this.tableHeaders[dataIndex].cloneNode(true);
				td.parentNode.insertBefore(clonedHeader, td);
			});
		});
	}
}

export default FlatTable;
