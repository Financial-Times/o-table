import BaseTable from './BaseTable';

// function to return a unique id to link header to data cells
let headerCount = 0;
const generateCellId = (cell) => {
	// Return an id if one already exists.
	if (cell instanceof Node && cell.getAttribute('id')) {
		return cell.getAttribute('id');
	}
	// Otherwise create an o-table id.
	return `o-table-flat-header-${headerCount++}`;
};

class FlatTable extends BaseTable {

	/**
	 * Initialises an `o-table` component with "flat" responsive behaviour.
	 *
	 * @access public
	 * @param {HTMLElement} rootEl - The `o-table` element.
	 * @param {TableSorter} sorter
	 * @param {Object} opts [{}]
	 * @param {Bool} opts.sortable [true]
	 * @returns {FlatTable}
	 */
	constructor(rootEl, sorter, opts = {}) {
		super(rootEl, sorter, opts);
		// Duplicate row headings before adding sort buttons.
		this._tableHeadersWithoutSort = this.tableHeaders.map(header => header.cloneNode(true));
		// Flat table can only work given headers.
		if (this.tableHeaders.length <= 0) {
			console.warn('Could not create a "flat" table as no headers were found. Ensure table headers are placed within "<thead>". Removing class "o-table--responsive-flat".', rootEl);
			rootEl.classList.remove('o-table--responsive-flat');
		} else {
			this._createFlatTableStructure();
		}
		// Defer other tasks.
		window.setTimeout(this.addSortButtons.bind(this), 0);
		window.setTimeout(this._ready.bind(this), 0);
		return this;
	}

	/**
	 * Update the o-table instance with rows added dynamically to the table.
	 *
	 * @returns {undefined}
	 */
	updateRows() {
		// Update new rows to support the flat structure.
		const latestRows = this._getLatestRowNodes();
		this._createFlatTableStructure(latestRows);
		// Update row visibility, sort, etc.
		super.updateRows();
	}

	/**
	 * Get all the table body's current row nodes, without nodes duplicated for
	 * the responsive "flat" style
	 *
	 * @returns {Array<Node>}
	 * @access private
	 */
	_getLatestRowNodes() {
		return this.tbody ? Array.from(this.tbody.querySelectorAll('tr:not(.o-table__duplicate-row)')) : [];
	}

	/**
	 * Duplicate table headers for each data item.
	 * I.e. Each row is shown as a single item with its own headings.
	 *
	 * @access private
	 */
	_createFlatTableStructure(rows = this.tableRows) {
		rows
			.filter(row => !row.hasAttribute('data-o-table-flat-headings')) // only process rows once
			.forEach((row, index) => {
				const data = Array.from(row.getElementsByTagName('td'));
				row.setAttribute('data-o-table-flat-headings', true);
				window.requestAnimationFrame(() => {
					// Create a new table body for every row.
					const newGroupBody = document.createElement('tbody');
					newGroupBody.classList.add('o-table__responsive-body');
					// Create a row in the new bodies for every data cell.
					const newGroupRow = document.createElement('tr');
					newGroupRow.classList.add('o-table__duplicate-row');
					// Create a column header "item x" for each new body.
					// First create a blank cell which will be the header for
					// for our new column header. This will prevent some assistive
					// technologies from reading a header our heading cell.
					// https://www.w3.org/WAI/tutorials/tables/multi-level/
					const newItemHeaderBlankItem = document.createElement('td');
					const newItemHeaderBlankItemId = generateCellId(newItemHeaderBlankItem);
					newItemHeaderBlankItem.setAttribute('id', newItemHeaderBlankItemId);
					newItemHeaderBlankItem.innerHTML = '&nbsp;';
					// Second create the actual header cell and set its headings
					// to the blank heading cell.
					const newItemHeader = document.createElement('th');
					newItemHeader.innerText = `Item ${index + 1}`;
					const groupHeaderId = generateCellId(newItemHeader);
					newItemHeader.setAttribute('id', groupHeaderId);
					newItemHeader.setAttribute('headers', `${newItemHeaderBlankItemId}`);
					newItemHeader.setAttribute('scope', 'colgroup');
					newItemHeader.classList.add('o-table__group-heading');
					// Append the heading items to the new row,
					// and append the new row to the new body.
					newGroupRow.appendChild(newItemHeader);
					newGroupRow.appendChild(newItemHeaderBlankItem);
					newGroupBody.appendChild(newGroupRow);
					// Append all the other rows as heading / value pairs.
					this._tableHeadersWithoutSort.forEach((header, index) => {
						// Create the row.
						const newRow = document.createElement('tr');
						newRow.classList.add('o-table__duplicate-row');
						// Duplicate the original heading cell and set headings.
						const clonedHeader = header.cloneNode(true);
						const clonedHeaderId = generateCellId(clonedHeader);
						clonedHeader.setAttribute('id', clonedHeaderId);
						clonedHeader.setAttribute('headers', `${groupHeaderId}`);
						clonedHeader.setAttribute('scope', 'row');
						clonedHeader.removeAttribute('role');
						// Duplicate the original data cell and set headings.
						const clonedTd = data[index].cloneNode(true);
						clonedTd.setAttribute('headers', `${groupHeaderId} ${clonedHeaderId}`);
						// Append the header and data cell to the row.
						newRow.appendChild(clonedHeader);
						newRow.appendChild(clonedTd);
						// Append the row to the body.
						newGroupBody.appendChild(newRow);
					});

					// Append the new bodies, which represent each row on
					// desktop, to the root element.
					this.rootEl.appendChild(newGroupBody);
				});
			});
	}
}

export default FlatTable;
