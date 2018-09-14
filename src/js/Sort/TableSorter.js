import CellFormatter from "./CellFormatter";

function getIntlCollator() {
	if (typeof Intl !== 'undefined' && {}.hasOwnProperty.call(Intl, 'Collator')) {
		return new Intl.Collator();
	}
}

function ascendingSort(a, b, intlCollator) {
	if ((typeof a === 'string' || a instanceof String) && (typeof b === 'string' || b instanceof String)) {
		return intlCollator ? intlCollator.compare(a, b) : a.localeCompare(b);
	} else if ((!isNaN(b) && isNaN(a)) || a < b) {
		return -1;
	} else if ((!isNaN(a) && isNaN(b)) || b < a) {
		return 1;
	} else {
		return 0;
	}
}

function descendingSort(...args) {
	return 0 - ascendingSort.apply(this, args);
}

class TableSorter {

	constructor() {
		this._cellFormatter = new CellFormatter();
	}

	sortRowsByColumn(table, columnIndex, sortOrder) {
		const tableHeaderElement = table.getTableHeader(columnIndex);

		if (!tableHeaderElement) {
			throw new Error(`Could not find header for column index "${columnIndex}".`);
		}

		if (!['ascending', 'descending'].includes(sortOrder)) {
			throw new Error(`Sort order "${sortOrder}" is not supported. Must be "ascending" or "descending".`);
		}

		// Add class for immediate visual feedback (only update aria when table has sorted successfully).
		window.requestAnimationFrame(() => {
			tableHeaderElement.classList.add(`o-table-sorting-${sortOrder}`);
		});

		const intlCollator = getIntlCollator();
		const cellFormatter = this._cellFormatter;
		const type = tableHeaderElement.getAttribute('data-o-table-data-type') || undefined;
		table.tableRows.sort((a, b) => {
			let aCol = a.children[columnIndex];
			let bCol = b.children[columnIndex];
			aCol = cellFormatter.formatCell({ cell: aCol, type });
			bCol = cellFormatter.formatCell({ cell: bCol, type });
			if (sortOrder === 'ascending') {
				return ascendingSort(aCol, bCol, intlCollator);
			} else {
				return descendingSort(aCol, bCol, intlCollator);
			}
		});

		window.requestAnimationFrame(() => {
			table.tableRows.forEach((row) => {
				table.tbody.appendChild(row);
			});
			table.tableHeaders.forEach((header) => {
				const headerSort = (header === tableHeaderElement ? sortOrder : 'none');
				header.setAttribute('aria-sort', headerSort);
				header.classList.remove(`o-table-sorting-ascending`);
				header.classList.remove(`o-table-sorting-descending`);
			});
			table.sorted({
				columnIndex,
				sortOrder
			});
		});
	}

	/**
	 * Set a custom sort filter for a given table cell data type.
	 * @see {@link CellFormatter#setFormatter} for `formatFunction` details.
	 * @access public
	 */
	setCellFormatterForType(type, formatFunction) {
		this._cellFormatter.setFormatter(type, formatFunction);
	}
}

export default TableSorter;
