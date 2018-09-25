/* eslint-env mocha */

import proclaim from 'proclaim';
import * as sandbox from './helpers/sandbox';
import * as fixtures from './helpers/fixtures';
import FlatTable from './../src/js/Tables/FlatTable';
import TableSorter from './../src/js/Sort/TableSorter';
const sorter = new TableSorter();

describe("FlatTable", () => {
	let oTableEl;

	beforeEach(() => {
		sandbox.init();
		sandbox.setContents(fixtures.shortTableWithContainer);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		oTableEl.classList.add('o-table--responsive-flat');
	});

	it('clones all headings into each row, so each cell has a row heading', (done) => {
		const table = new FlatTable(oTableEl, sorter);
		setTimeout(() => {
			try {
				proclaim.equal(table.tableRows.length, 5, `Expected to find 5 table rows.`);
				table.tableRows.forEach(row => {
					const duplicateHeadingClass = '.o-table__duplicate-heading';
					const duplicateHeadings = row.querySelectorAll(`${duplicateHeadingClass}[scope="row"][role="rowheader"]`);
					proclaim.equal(duplicateHeadings.length, 5, `Expected table rows to contain a clone of all headings,  with class "${duplicateHeadingClass}", scope="row", and role="rowheader".`);
				});
			} catch (error) {
				done(error);
			}
			done();
		}, 2); // wait for window.requestAnimationFrame
	});

});
