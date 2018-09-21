import BaseTable from './BaseTable';

class FlatTable extends BaseTable {

	/**
	 * Initialises a "flat" o-table component.
	 *
	 * @param {HTMLElement} rootEl - The `o-table` element.
	 * @param {TableSorter} sorter
	 * @param {Object} opts
	 * @returns {FlatTable} - A FlatTable instance
	 */
	constructor(rootEl, sorter, opts = {}) {
		super(rootEl, sorter, opts);
		// Flat table can only work given headers.
		if (this.tableHeaders.length > 0) {
			this._duplicateHeaders(rootEl);
		} else {
			console.warn('Could create a "flat" table as no headers were found. Ensure table headers are placed within "<thead>". Removing class "o-table--responsive-flat".', rootEl);
			rootEl.classList.remove('o-table--responsive-flat');
		}
		window.requestAnimationFrame(this._addSortButtons.bind(this));
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
