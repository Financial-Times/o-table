/* eslint-env mocha, sinon, proclaim */

import proclaim from 'proclaim';
import sinon from 'sinon/pkg/sinon';

import * as sandbox from './helpers/sandbox';
import * as fixtures from './helpers/fixtures';
import OTable from './../main';
import BaseTable from './../src/js/Tables/BaseTable';
import OverflowTable from './../src/js/Tables/OverflowTable';

describe("oTable API", () => {

	it("is defined", () => {
		proclaim.isFunction(OTable);
	});

	// @todo test for existence of final public api.
});

describe('An oTable instance', () => {
	let oTableEl;
	let testOTable;

	beforeEach(() => {
		sandbox.init();
		sandbox.setContents(fixtures.shortTableWithContainer);
		oTableEl = document.querySelector('[data-o-component=o-table]');
	});

	afterEach(() => {
		testOTable = undefined;
		sandbox.reset();
		oTableEl = undefined;
	});

	it('is defined', () => {
		testOTable = new OTable(oTableEl);
		proclaim.isObject(testOTable);
	});

	it('has the correct prototype', () => {
		testOTable = new OTable(oTableEl);
		proclaim.isInstanceOf(testOTable, BaseTable);
		proclaim.isInstanceOf(testOTable, OverflowTable);
		// @todo check instance of other table types
	});

	describe('when the table has data-o-table-responsive="flat"', () => {

		beforeEach(() => {
			oTableEl.setAttribute('data-o-table-responsive','flat');
		});

		it('should clone any `<th>` elements into all of the rows in the `<tbody>`', (done) => {
			testOTable = new OTable(oTableEl);
			setTimeout(() => {
				const allBodyTableHeads = oTableEl.querySelectorAll('tbody th');
				proclaim.lengthEquals(allBodyTableHeads, 25);

				const firstRow = oTableEl.querySelectorAll('tbody tr')[0];
				const firstRowTableHeads = firstRow.querySelectorAll('th');
				proclaim.lengthEquals(firstRowTableHeads, 5);
				done();
			}, 100);

		});

	});

	it('fires an "oTable.ready" event when the JS for the component has executed', done => {
		oTableEl.addEventListener('oTable.ready', function() {
			done();
		});
		testOTable = new OTable(oTableEl);
	});

});

describe('Init', () => {

	beforeEach(() => {
		sandbox.init();
		sandbox.setContents(`
			${fixtures.shortTableWithContainer}
			${fixtures.shortTableWithContainer}
			${fixtures.shortTableWithContainer}
		`);
	});

	afterEach(() => {
		sandbox.reset();
	});

	it('instantiates every o-table piece of markup within the element given', (done) => {
		const oTables = OTable.init();
		setTimeout(() => {
			const tables = oTables.map(oTable => oTable.rootEl);
			proclaim.equal(tables.length, 3);
			done();
		}, 100);
	});
});

describe('Destroying an oTable instance', () => {
	let oTableEl;
	let testOTable;

	beforeEach(() => {
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<th>Cheese</th>
				</thead>
				<tbody>
					<tr>
						<td>cheddar</td>
					</tr>
					<tr>
						<td>stilton</td>
					</tr>
					<tr>
						<td>red leicester</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
	});

	afterEach(() => {
		testOTable = undefined;
		sandbox.reset();
		oTableEl = undefined;
	});

	it('when destroyed, removes all event listeners which were added by the component', (done) => {
		const realAddEventListener = Element.prototype.addEventListener;
		const addEventListenerSpy = sinon.spy();
		Element.prototype.addEventListener = addEventListenerSpy;

		const realRemoveEventListener = Element.prototype.removeEventListener;
		const removeEventListenerSpy = sinon.spy();
		Element.prototype.removeEventListener = removeEventListenerSpy;

		testOTable = new OTable(oTableEl);
		setTimeout(() => {
			testOTable.destroy();
			const columnHeadButtonEventAndHandler = addEventListenerSpy.args[0];
			const columnHeadButton = document.querySelector('th button');
			let error;
			try	{
				proclaim.isTrue(addEventListenerSpy.called);
				proclaim.isTrue(removeEventListenerSpy.calledOn(columnHeadButton), 'Remove event listener was not called on the column sort button.');
				proclaim.isTrue(removeEventListenerSpy.called, 'Remove event listener was not called on the column sort button.');
				proclaim.isTrue(removeEventListenerSpy.calledWith(...columnHeadButtonEventAndHandler), 'Remove event listener was not called with the event handler.');
			} catch(err) {
				error = err;
			} finally {
				Element.prototype.addEventListener = realAddEventListener;
				Element.prototype.removeEventListener = realRemoveEventListener;
				done(error);
			}
		}, 100);
	});

	it('when destroyed, removes the rootEl property from the object', () => {
		testOTable = new OTable(oTableEl);
		testOTable.destroy();
		proclaim.isUndefined(testOTable.rootEl);
	});
});

describe("getTableHeader()", () => {
	let oTableEl;
	let testOTable;

	beforeEach(() => {
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<th id="firstHeader">Cheese</th>
					<th id="secondHeader">Letter</th>
				</thead>
				<tbody>
					<tr>
						<td>cheddar</td>
						<td>a</td>
					</tr>
					<tr>
						<td>stilton</td>
						<td>b</td>
					</tr>
					<tr>
						<td>red leicester</td>
						<td>c</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
	});

	afterEach(() => {
		sandbox.reset();
	});

	it('gets the first header for a column index of "0"', () => {
		const columnIndex = 0;
		const actual = testOTable.getTableHeader(columnIndex);
		const expected = document.getElementById('firstHeader');
		proclaim.equal(actual, expected);
	});

	it('gets the first header for a column index of "1"', () => {
		const columnIndex = 1;
		const actual = testOTable.getTableHeader(columnIndex);
		const expected = document.getElementById('secondHeader');
		proclaim.equal(actual, expected);
	});
});
