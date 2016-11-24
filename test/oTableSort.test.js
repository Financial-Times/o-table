/* eslint-env mocha, proclaim */
import proclaim from 'proclaim';

const sandbox = require('./helpers/sandbox');
const OTable = require('./../main');

describe('oTable sorting', () => {
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

	it('is defined', () => {
		testOTable = new OTable(oTableEl);
		proclaim.isObject(testOTable);
	});

	it('sorts by ascending order first if not told otherwise', done => {
		testOTable = new OTable(oTableEl);
		// TODO - Add a click polyfill to polyfill-service
		const click = document.createEvent("MouseEvent");
		click.initMouseEvent("click", true, true, window,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		oTableEl.querySelector('thead th').dispatchEvent(click);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, 'cheddar');
			proclaim.equal(rows[1].textContent, 'red leicester');
			proclaim.equal(rows[2].textContent, 'stilton');
			done();
		});
	});

	it('adds a sort order data attribute to the root element of the component', done => {
		testOTable = new OTable(oTableEl);
		// TODO - Add a click polyfill to polyfill-service
		const click = document.createEvent("MouseEvent");
		click.initMouseEvent("click", true, true, window,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		oTableEl.querySelector('thead th').dispatchEvent(click);
		oTableEl.addEventListener('oTable.sorted', () => {
			proclaim.equal(oTableEl.getAttribute('data-o-table-order'), 'ASC');
			done();
		});
	});

	it('alternates sorting between ascending and descending', done => {
		testOTable = new OTable(oTableEl);
		// TODO - Add a click polyfill to polyfill-service
		const click = document.createEvent("MouseEvent");
		click.initMouseEvent("click", true, true, window,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		oTableEl.querySelector('thead th').dispatchEvent(click);
		oTableEl.querySelector('thead th').dispatchEvent(click);
		oTableEl.addEventListener('oTable.sorted', () => {
			proclaim.equal(oTableEl.getAttribute('data-o-table-order'), 'DES');
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, 'stilton');
			proclaim.equal(rows[1].textContent, 'red leicester');
			proclaim.equal(rows[2].textContent, 'cheddar');
			done();
		});
	});

	it('sorts strings alphabetically', done => {
		testOTable = new OTable(oTableEl);
		// TODO - Add a click polyfill to polyfill-service
		const click = document.createEvent("MouseEvent");
		click.initMouseEvent("click", true, true, window,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		oTableEl.querySelector('thead th').dispatchEvent(click);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, 'cheddar');
			proclaim.equal(rows[1].textContent, 'red leicester');
			proclaim.equal(rows[2].textContent, 'stilton');
			proclaim.equal(oTableEl.getAttribute('data-o-table-order'), 'ASC');
			done();
		});
	});

	it('sorts columns marked as numeric, numerically', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<th data-o-table-data-type="numeric">Price</th>
				</thead>
				<tbody>
					<tr>
						<td data-o-table-data-type="numeric">12.03</td>
					</tr>
					<tr>
						<td data-o-table-data-type="numeric">1.2</td>
					</tr>
					<tr>
						<td data-o-table-data-type="numeric">3</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		// TODO - Add a click polyfill to polyfill-service
		const click = document.createEvent("MouseEvent");
		click.initMouseEvent("click", true, true, window,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		oTableEl.querySelector('thead th').dispatchEvent(click);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, '1.2');
			proclaim.equal(rows[1].textContent, '3');
			proclaim.equal(rows[2].textContent, '12.03');
			proclaim.equal(oTableEl.getAttribute('data-o-table-order'), 'ASC');
			done();
		});
	});

	it('sorts via data-o-table-order if it is set', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<th>Things</th>
				</thead>
				<tbody>
					<tr>
						<td data-o-table-order=2>snowman</td>
					</tr>
					<tr>
						<td data-o-table-order=3>42</td>
					</tr>
					<tr>
						<td data-o-table-order=1>pangea</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		// TODO - Add a click polyfill to polyfill-service
		const click = document.createEvent("MouseEvent");
		click.initMouseEvent("click", true, true, window,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		oTableEl.querySelector('thead th').dispatchEvent(click);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, 'pangea');
			proclaim.equal(rows[1].textContent, 'snowman');
			proclaim.equal(rows[2].textContent, '42');
			proclaim.equal(oTableEl.getAttribute('data-o-table-order'), 'ASC');
			done();
		});
	});
});