/* eslint-env mocha, sinon, proclaim */

import proclaim from 'proclaim';

import * as sandbox from './helpers/sandbox';
import * as fixtures from './helpers/fixtures';
import OverflowTable from './../src/js/Tables/OverflowTable';
import TableSorter from './../src/js/Sort/TableSorter';
const sorter = new TableSorter();

function expandable(oTableEl, { minimumRowCount, expanded }) {
	oTableEl.setAttribute('data-o-table-expanded', expanded);
	oTableEl.setAttribute('data-o-table-minimum-row-count', minimumRowCount);
}

function noTableWrapperOrContainer(oTableEl) {
	sandbox.setContents(oTableEl.outerHTML);
	return document.querySelector('[data-o-component=o-table]');
}

function canScrollTable() {
	document.documentElement.style.width = '340px';
}

function scrollTable(oTableEl, { toEnd }) {
	const wrapper = oTableEl.closest('.o-table-wrapper');
	const scrollTo = toEnd ? oTableEl.getBoundingClientRect().width : 0;
	setTimeout(() => {
		wrapper.scrollLeft = scrollTo;
	}, 50);
}

function canScrollPastTable() {
	document.documentElement.style['padding-bottom'] = '10000px';
}

function scrollPastTable() {
	document.documentElement.scrollTop = document.documentElement.getBoundingClientRect().height;
}

function forceExpandedTableTallerThanViewport(oTableEl) {
	const viewportHeight = document.documentElement.clientHeight;
	const tableHeight = oTableEl.getBoundingClientRect().height;
	if (tableHeight < viewportHeight) {
		oTableEl.style.height = `${viewportHeight * 2}px`;
	}
	return oTableEl;
}

function assertBackButton({ disabled, visuallyHidden, sticky, docked }) {
	const backElement = document.querySelector('.o-table-control--back');
	const backButton = backElement.querySelector('button');
	proclaim.equal(backElement.classList.contains('o-table-control--hide'), visuallyHidden, `Back button is ${visuallyHidden ? 'visible' : 'not visible'}.`);
	proclaim.equal(backButton.hasAttribute('disabled'), disabled, `Back button is ${disabled ? 'not disabled' : 'disabled'}.`);
	if (sticky !== undefined) {
		proclaim.equal(backElement.classList.contains('o-table-control--sticky'), sticky, `Back button is ${sticky ? 'not sticky' : 'sticky'}.`);
	}
	if (docked !== undefined) {
		proclaim.equal(backElement.classList.contains('o-table-control--dock'), sticky, `Back button is ${docked ? 'not docked' : 'docked'}.`);
	}
}

function assertForwardButton({ disabled, visuallyHidden, sticky, docked }) {
	const forwardElement = document.querySelector('.o-table-control--forward');
	const forwardButton = forwardElement.querySelector('button');
	proclaim.equal(forwardElement.classList.contains('o-table-control--hide'), visuallyHidden, `Forward button is ${visuallyHidden ? 'visible' : 'not visible'}.`);
	proclaim.equal(forwardButton.hasAttribute('disabled'), disabled, `Forward button is ${disabled ? 'not disabled' : 'disabled'}.`);
	if (sticky !== undefined) {
		proclaim.equal(forwardElement.classList.contains('o-table-control--sticky'), sticky, `Forward button is ${sticky ? 'not sticky' : 'sticky'}.`);
	}
	if (docked !== undefined) {
		proclaim.equal(forwardElement.classList.contains('o-table-control--dock'), sticky, `Forward button is ${docked ? 'not docked' : 'docked'}.`);
	}
}

function assertExpanded(table, { expanded, minimumRowCount }) {
	expanded = typeof expanded === 'boolean' ? expanded : true;
	minimumRowCount = minimumRowCount || 20;
	const expectedButtonContent = expanded ? 'show fewer' : 'show more';
	const expectedAriaExpanded = expanded ? 'true' : 'false';
	const expectedHidden = expanded ? 0 : table.tableRows.length - minimumRowCount;
	const wrapperHeightCorrect = (table.wrapper.style.height === '' && expanded) || (table.wrapper.style.height !== '' && !expanded);
	proclaim.include(table.container.innerHTML.toLowerCase(), expectedButtonContent, `Expected to see "${expectedButtonContent}" within an expanded table.`);
	proclaim.isTrue(table.rootEl.getAttribute('aria-expanded') === expectedAriaExpanded, `Expected to see \'aria-expanded="${expectedAriaExpanded}"\' on an expanded table.`);
	proclaim.equal(table.tbody.querySelectorAll('tr[aria-hidden="true"]').length, expectedHidden, `Expected ${expectedHidden} table rows to be hidden in an expanded table,`);
	proclaim.isTrue(wrapperHeightCorrect, `Expect the table wrapper to ${expanded ? 'not have' : 'have'} a set height to hide rows visually.`);
}

describe("OverflowTable", () => {
	let oTableEl;

	beforeEach(() => {
		sandbox.init();
		document.documentElement.style['padding-bottom'] = '';
		document.documentElement.style.width = '';
		sandbox.setContents(fixtures.longTableWithContainer);
		oTableEl = document.querySelector('[data-o-component=o-table]');
	});

	describe("expandable feature", () => {

		it("errors if there is not a container element and expander enabled", (done) => {
			oTableEl = noTableWrapperOrContainer(oTableEl);
			expandable(oTableEl, { expanded: false });
			window.onerror = function (message, file, line, col, error) {
				proclaim.include(error.message, 'container', 'Expected an error when a table is configured to be expandable but has no container element.');
				window.onerror = null;
				done();
				return true;
			};
			new OverflowTable(oTableEl, sorter);
		});

		it("is not enabled by default", () => {
			const table = new OverflowTable(oTableEl, sorter);
			proclaim.isFalse(table.canExpand());
		});

		it("can be configured to be expanded by default", (done) => {
			expandable(oTableEl, { expanded: true });
			const table = new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertExpanded(table, { expanded: true });
				done();
			}, 100);
		});

		it("can be configured to be contracted by default", (done) => {
			expandable(oTableEl, { expanded: false });
			const table = new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertExpanded(table, { expanded: false });
				done();
			}, 100);
		});

		it("can toggle between expanded and contracted programmatically when expandable", (done) => {
			expandable(oTableEl, { expanded: true });
			const table = new OverflowTable(oTableEl, sorter);
			table.contractTable();
			setTimeout(() => {
				assertExpanded(table, { expanded: false });
				table.expandTable();
				setTimeout(() => {
					assertExpanded(table, { expanded: true });
					done();
				}, 500);
			}, 500);
		});

		it("can configure the number of rows to contract to", (done) => {
			expandable(oTableEl, { minimumRowCount: 2, expanded: false });
			const table = new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertExpanded(table, { expanded: false, minimumRowCount: 2});
				done();
			}, 100);
		});

		it("is not used if the number of rows to contract to is larger than the table", (done) => {
			expandable(oTableEl, { minimumRowCount: 200, expanded: false });
			const table = new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				proclaim.isFalse(table.canExpand());
				proclaim.isFalse(table.rootEl.hasAttribute('aria-expanded'), `Did not expect "aria-expanded" on a table which can not expand.`);
				done();
			}, 100);
		});
	});


	describe("scroll controls", () => {
		beforeEach(() => {
			canScrollTable();
		});

		it("are not added if there are no wrapper and container elements", (done) => {
			oTableEl = noTableWrapperOrContainer(oTableEl);
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				proclaim.isNull(oTableEl.querySelector('.o-table-control--forward'), 'Did not expect to find a forward button.');
				proclaim.isNull(oTableEl.querySelector('.o-table-control--back'), 'Did not expect to find a back button.');
				done();
			}, 100);
		});

		it("forward / backward buttons are added given wrapper and container elements", (done) => {
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				proclaim.isNotNull(document.querySelector('.o-table-control--forward'), 'Did not find forward button.');
				proclaim.isNotNull(document.querySelector('.o-table-control--back'), 'Did not find back button.');
				done();
			}, 100);
		});

		it("backward button is disabled and visualy hidden at the start of the table, if the table is shorter than the viewport and scrolling past the table is not possible", (done) => {
			// reset sandbox to use a table smaller than the viewport
			sandbox.init();
			sandbox.setContents(fixtures.shortTableWithContainer);
			oTableEl = document.querySelector('[data-o-component=o-table]');
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertBackButton({
					disabled: true,
					visuallyHidden: true
				});
				done();
			}, 100);
		});

		it("forward button is disabled and visualy hidden at the end of the table, if the table is shorter than the viewport and scrolling past the table is not possible", (done) => {
			// reset sandbox to use a table smaller than the viewport
			sandbox.setContents(fixtures.shortTableWithContainer);
			oTableEl = document.querySelector('[data-o-component=o-table]');
			new OverflowTable(oTableEl, sorter);
			scrollTable(oTableEl, { toEnd: true });
			setTimeout(() => {
				assertForwardButton({
					disabled: true,
					visuallyHidden: true
				});
				done();
			}, 100);
		});

		it("backward button is disabled but visible at the start of the table, when the table can be scrolled past", (done) => {
			canScrollPastTable();
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertBackButton({
					disabled: true,
					visuallyHidden: false
				});
				done();
			}, 100);
		});

		it("forward button is disabled but visible at the end of the table, when the table can be scrolled past", (done) => {
			canScrollPastTable();
			new OverflowTable(oTableEl, sorter);
			scrollTable(oTableEl, { toEnd: true });
			setTimeout(() => {
				assertForwardButton({
					disabled: true,
					visuallyHidden: false
				});
				done();
			}, 100);
		});
		it("forward / backward buttons are sticky and hidden when the table is scrolled past", (done) => {
			canScrollPastTable();
			scrollPastTable();
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertBackButton({
					disabled: true,
					visuallyHidden: true,
					sticky: true
				});
				assertForwardButton({
					disabled: true,
					visuallyHidden: true,
					sticky: true
				});
				done();
			}, 100);
		});
		it("forward / backward buttons are not sticky when the table can not be scrolled past", (done) => {
			// reset sandbox to use a table smaller than the viewport
			sandbox.setContents(fixtures.shortTableWithContainer);
			oTableEl = document.querySelector('[data-o-component=o-table]');
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertBackButton({
					disabled: true, // disabled as at the start of the table
					visuallyHidden: true, // hidden as at the start of the table
					sticky: false
				});
				assertForwardButton({
					disabled: false,
					visuallyHidden: false,
					sticky: false
				});
				done();
			}, 100);
		});
	});

	describe("control dock", () => {
		function assertDock(hasDock) {
			const controlOverlay = document.querySelector('.o-table-control-overlay');
			proclaim.equal(controlOverlay.classList.contains('o-table-control-overlay--arrow-dock'), hasDock, `Table control overlay does ${hasDock ? 'not have a control dock' : 'has a control dock'}.`);
		}
		it("is added given the table is scrollable, expandable, and can be scrolled past", (done) => {
			canScrollTable();
			expandable(oTableEl, { expanded: true });
			forceExpandedTableTallerThanViewport(oTableEl);
			canScrollPastTable();
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertDock(true);
				done();
			}, 100);
		});
		it("is not added given the table is smaller than the viewport", (done) => {
			canScrollTable();
			expandable(oTableEl, { minimumRowCount: 3, expanded: false }); // assumes a contracted table is smaller than the viewport
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertDock(false);
				done();
			}, 100);
		});
		it("is added if the table is smaller than the viewport and can be scrolled past", (done) => {
			canScrollTable();
			canScrollPastTable();
			expandable(oTableEl, { minimumRowCount: 3, expanded: false }); // assumes a contracted table is smaller than the viewport
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertDock(true);
				done();
			}, 100);
		});
		it("is not added given the table is not scrollable", (done) => {
			expandable(oTableEl, { expanded: false });
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertDock(false);
				done();
			}, 100);
		});
		it("is not added given the table is not expandable", (done) => {
			canScrollTable();
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertDock(false);
				done();
			}, 100);
		});
		it("scroll controls are not sticky and instead \"dock\" given the dock exists and the table is shorter than the viewport", (done) => {
			canScrollTable();
			expandable(oTableEl, { minimumRowCount: 3, expanded: false }); // assumes non-expanded table is shorter than viewport
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertForwardButton({
					disabled: false,
					visuallyHidden: false,
					sticky: false,
					dock: true
				});
				done();
			}, 100);
		});
		it("scroll controls do not \"dock\" if the dock does not exist", (done) => {
			canScrollTable();
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertBackButton({
					disabled: true, // disabled as at the start
					visuallyHidden: true, // hidden as at the start and not in a dock
					dock: false
				});
				done();
			}, 100);
		});
		it("scroll controls do not \"dock\" when the table is taller than the viewport", (done) => {
			canScrollTable();
			expandable(oTableEl, { expanded: true });
			forceExpandedTableTallerThanViewport(oTableEl);
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertBackButton({
					disabled: true, // disabled as at the start
					visuallyHidden: true, // hidden as at the start and not in a dock
					dock: false
				});
				done();
			}, 100);
		});
		it("sticky scroll controls are visually hidden when scrolling past a table with no \"dock\".", (done) => {
			canScrollTable();
			canScrollPastTable();
			scrollPastTable();
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertForwardButton({
					disabled: true,
					visuallyHidden: true, // hidden as scrolled past the table
					sticky: true,
					dock: false
				});
				done();
			}, 100);
		});
		it("sticky scroll controls remain visible when scrolling past a table with a \"dock\".", (done) => {
			canScrollTable();
			expandable(oTableEl, { expanded: false });
			canScrollPastTable();
			scrollPastTable();
			new OverflowTable(oTableEl, sorter);
			setTimeout(() => {
				assertBackButton({
					disabled: true, // disabled as at the start
					visuallyHidden: false, // visible in dock (does not scroll off table)
					sticky: true,
					dock: true
				});
				done();
			}, 100);
		});
	});
});
