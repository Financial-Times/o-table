import FlatTable from './Tables/FlatTable';
import ScrollTable from './Tables/ScrollTable';
import OverflowTable from './Tables/OverflowTable';

import TableSorter from './Sort/TableSorter';
const sorter = new TableSorter();

class OTable {

	/**
	 * Initialises o-table component(s).
	 *
	 * @param {HTMLElement} - o-table element
	 * @param {Object} opts
	 * @returns {FlatTable | ScrollTable | OverflowTable} - A BaseTable instance
	 */
	constructor(rootEl, opts = {}) {
		const tableType = rootEl.getAttribute('data-o-table-responsive');
		let Table;
		switch (tableType) {
			case 'flat':
				Table = FlatTable;
				break;
			case 'scroll':
				Table = ScrollTable;
				break;
			default:
				Table = OverflowTable;
				break;
		}
		return new Table(rootEl, sorter, opts);
	}

	/**
	 * Initialises all o-table components inside the element passed as the first parameter
	 *
	 * @access public
	 * @param {(HTMLElement|string)} [el=document.body] - Element where to search for o-table components. You can pass an HTMLElement or a selector string
	 * @param {Object} opts
	 * @returns {Array|OverflowTable|OTable|FlatTable} - An array of OTable instances or a single OTable instance
	 */
	static init(el = document.body, opts = {}) {
		if (!(el instanceof HTMLElement)) {
			el = document.querySelector(el);
		}
		if (/\bo-table\b/.test(el.getAttribute('data-o-component'))) {
			return new OTable(el, opts);
		}
		const tableEls = Array.from(el.querySelectorAll('[data-o-component~="o-table"]'));
		return tableEls.map(el => {
			return new OTable(el, opts);
		});
	}

	/**
	 * Set a custom sort filter for a given table cell data type.
	 * @see {@link CellFormatter#setFormatter} for `formatFunction` details.
	 * @access public
	 */
	static setSortFormatterForType(type, formatFunction) {
		sorter.setCellFormatterForType(type, formatFunction);
	}
}

module.exports = OTable;
