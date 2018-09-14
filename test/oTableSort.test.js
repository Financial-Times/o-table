/* eslint-env mocha, proclaim */
import proclaim from 'proclaim';
import sinon from 'sinon/pkg/sinon';

import * as sandbox from './helpers/sandbox';
import OTable from './../main';

describe('oTable sorting', () => {
	let oTableEl;
	let testOTable;

	const assertExpectedSort = (oTableEl, sort) => {
		if (typeof oTableEl === 'string') {
			oTableEl = document.querySelector(oTableEl);
		}
		return new Promise((resolve) => {
			// Timeout allows for dom to update (window.requestAnimationFrame)
			setTimeout(() => {
				proclaim.equal(oTableEl.getAttribute('aria-sort'), sort);
				resolve(true);
			}, 10);
		});
	};

	const click = element => {
		const click = document.createEvent('MouseEvent');
		click.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		oTableEl.querySelector(element).dispatchEvent(click);
	};

	beforeEach(() => {
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th>Cheese</th>
					</tr>
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
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, 'cheddar');
			proclaim.equal(rows[1].textContent, 'red leicester');
			proclaim.equal(rows[2].textContent, 'stilton');
			done();
		});
		click('thead th button');
	});

	it('does not sort if the heading has an attribute specifying not to', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th data-o-table-heading-disable-sort>Things</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>a</td>
					</tr>
					<tr>
						<td>c</td>
					</tr>
					<tr>
						<td>b</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		const click = document.createEvent("MouseEvent");
		click.initMouseEvent("click", true, true, window,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		oTableEl.querySelector('thead th[data-o-table-heading-disable-sort]').dispatchEvent(click);
		setTimeout(() => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[1].textContent, 'c', 'The table column sorted with a click when sort was disabled for its header.');
			done();
		}, 50);
	});

	it('alternates sorting between ascending and descending', done => {
		testOTable = new OTable(oTableEl);
		// First click ascending
		click('thead th button');
		// Second click descending
		setTimeout(() => {
			oTableEl.addEventListener('oTable.sorted', () => {
				const rows = oTableEl.querySelectorAll('tbody tr td');
				proclaim.equal(rows[0].textContent, 'stilton');
				proclaim.equal(rows[1].textContent, 'red leicester');
				proclaim.equal(rows[2].textContent, 'cheddar');
				assertExpectedSort('thead th', 'descending').then(() => {
					done();
				});
			});
			click('thead th button');
		}, 50);
	});

	it('sorts strings alphabetically', done => {
		testOTable = new OTable(oTableEl);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, 'cheddar');
			proclaim.equal(rows[1].textContent, 'red leicester');
			proclaim.equal(rows[2].textContent, 'stilton');
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});
		click('thead th button');
	});

	it('sorts columns marked as "numeric", numerically', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th data-o-table-data-type="numeric">Price</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td data-o-table-data-type="numeric"></td>
					</tr>
					<tr>
						<td data-o-table-data-type="numeric">12.03</td>
					</tr>
					<tr>
						<td data-o-table-data-type="numeric">480,000</td>
					</tr>
					<tr>
						<td data-o-table-data-type="numeric">1.2</td>
					</tr>
					<tr>
						<td data-o-table-data-type="numeric">3</td>
					</tr>
					<tr>
						<td data-o-table-data-type="numeric">1,216,000</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, '');
			proclaim.equal(rows[1].textContent, '1.2');
			proclaim.equal(rows[2].textContent, '3');
			proclaim.equal(rows[3].textContent, '12.03');
			proclaim.equal(rows[4].textContent, '480,000');
			proclaim.equal(rows[5].textContent, '1,216,000');
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});
		click('thead th button');
	});

	it('sorts columns marked as "number", numerically', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th data-o-table-data-type="number">Price</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td data-o-table-data-type="number">12.03</td>
					</tr>
					<tr>
						<td data-o-table-data-type="number">480,000</td>
					</tr>
					<tr>
						<td data-o-table-data-type="number"></td>
					</tr>
					<tr>
						<!-- hyphen is treated as an empty cell -->
						<td data-o-table-data-type="number">-</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[1].textContent, '-');
			proclaim.equal(rows[2].textContent, '12.03');
			proclaim.equal(rows[3].textContent, '480,000');
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});
		click('thead th button');
	});

	it('Sorts non-numeric fields in a numeric column first.', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th data-o-table-data-type="number">Price</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td data-o-table-data-type="number">12.03</td>
					</tr>
					<tr>
						<!-- N/A -->
						<td data-o-table-data-type="number">N/A</td>
					</tr>
					<tr>
						<td data-o-table-data-type="number">Some Text</td>
					</tr>
					<tr>
						<td data-o-table-data-type="number">480,000</td>
					</tr>
					<tr>
						<td data-o-table-data-type="number"></td>
					</tr>
					<tr>
						<!-- hyphen is treated as an empty cell -->
						<td data-o-table-data-type="number">-</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			// "n/a" and "-" treated as blank and come first in an ascending order.
			proclaim.equal(rows[0].textContent, 'N/A');
			proclaim.equal(rows[1].textContent, '');
			proclaim.equal(rows[2].textContent, '-');
			// Non-numeric fields come next.
			proclaim.equal(rows[3].textContent, 'Some Text');
			// Followed by numeric fields.
			proclaim.equal(rows[4].textContent, '12.03');
			proclaim.equal(rows[5].textContent, '480,000');
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});
		click('thead th button');
	});

	it('removes en-dash range symbol when formatting numeric values (range sort is not implicity supported, sorts by first number only)', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th data-o-table-data-type="number">Ranges</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td data-o-table-data-type="number">200–300</td>
					</tr>
					<tr>
						<!-- hyphen is treated as an en-dash -->
						<td data-o-table-data-type="number">2.3-3m</td>
					</tr>
					<tr>
						<td data-o-table-data-type="number">1m–2m</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, '2.3-3m');
			proclaim.equal(rows[1].textContent, '200–300');
			proclaim.equal(rows[2].textContent, '1m–2m');
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});
		click('thead th button');
	});

	it('sorts columns marked as "percent"', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th data-o-table-data-type="percent">Percent</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td data-o-table-data-type="percent">5%</td>
					</tr>
					<tr>
						<td data-o-table-data-type="percent">20%</td>
					</tr>
					<tr>
						<td data-o-table-data-type="percent">5.5%</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, '5%');
			proclaim.equal(rows[1].textContent, '5.5%');
			proclaim.equal(rows[2].textContent, '20%');
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});
		click('thead th button');
	});

	it('sorts FT style times marked as "date"', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th data-o-table-data-type="date">Times</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td data-o-table-data-type="date">7pm</td>
					</tr>
					<tr>
						<td data-o-table-data-type="date">7am</td>
					</tr>
					<tr>
						<td data-o-table-data-type="date">6.30am</td>
					</tr>
					<tr>
						<td data-o-table-data-type="date">6.30pm</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, '6.30am');
			proclaim.equal(rows[1].textContent, '7am');
			proclaim.equal(rows[2].textContent, '6.30pm');
			proclaim.equal(rows[3].textContent, '7pm');
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});
		click('thead th button');
	});

	it('sorts FT style dates marked as "date"', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th data-o-table-data-type="date">Times</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<!–– assumes current year ––>
						<td data-o-table-data-type="date">August 17</td>
					</tr>
					<tr>
						<td data-o-table-data-type="date">September 12 2012</td>
					</tr>
					<tr>
						<td data-o-table-data-type="date">January 2012</td>
					</tr>
					<tr>
						<td data-o-table-data-type="date">March 12 2015 1am</td>
					</tr>
					<tr>
						<td data-o-table-data-type="date">April 20 2014 3.30am</td>
					</tr>
					<tr>
						<td data-o-table-data-type="date">April 20 2014 2.30pm</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, 'January 2012');
			proclaim.equal(rows[1].textContent, 'September 12 2012');
			proclaim.equal(rows[2].textContent, 'April 20 2014 3.30am');
			proclaim.equal(rows[3].textContent, 'April 20 2014 2.30pm');
			proclaim.equal(rows[4].textContent, 'March 12 2015 1am');
			proclaim.equal(rows[5].textContent, 'August 17'); // assumes current year
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});
		click('thead th button');
	});

	it('sorts abbreviated currency marked as "currency"', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th data-o-table-data-type="currency">Price</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td data-o-table-data-type="currency">$140</td>
					</tr>
					<tr>
						<td data-o-table-data-type="currency">£4</td>
					</tr>
					<tr>
						<td data-o-table-data-type="currency">€5.46</td>
					</tr>
					<tr>
						<td data-o-table-data-type="currency">￥155</td>
					</tr>
					<tr>
						<td data-o-table-data-type="currency">Rmb100bn</td>
					</tr>
					<tr>
						<td data-o-table-data-type="currency">DKr10</td>
					</tr>
					<tr>
						<td data-o-table-data-type="currency">CFA Fr830</td>
					</tr>
					<tr>
						<td data-o-table-data-type="currency">HK$12</td>
					</tr>
					<tr>
						<td data-o-table-data-type="currency">E£5</td>
					</tr>
					<tr>
						<td data-o-table-data-type="currency">Rp3,400</td>
					</tr>
					<tr>
						<td data-o-table-data-type="currency">13 colons</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, '£4');
			proclaim.equal(rows[1].textContent, 'E£5');
			proclaim.equal(rows[2].textContent, '€5.46');
			proclaim.equal(rows[3].textContent, 'DKr10');
			proclaim.equal(rows[4].textContent, 'HK$12');
			proclaim.equal(rows[5].textContent, '13 colons');
			proclaim.equal(rows[6].textContent, '$140');
			proclaim.equal(rows[7].textContent, '￥155');
			proclaim.equal(rows[8].textContent, 'CFA Fr830');
			proclaim.equal(rows[9].textContent, 'Rp3,400');
			proclaim.equal(rows[10].textContent, 'Rmb100bn');
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});
		click('thead th button');
	});

	it('sorts via data-o-table-sort-value alphabetically if it is set', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th>Things</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td data-o-table-sort-value="c">snowman</td>
					</tr>
					<tr>
						<td data-o-table-sort-value="a">42</td>
					</tr>
					<tr>
						<td data-o-table-sort-value="b">pangea</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, '42');
			proclaim.equal(rows[1].textContent, 'pangea');
			proclaim.equal(rows[2].textContent, 'snowman');
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});
		click('thead th button');
	});

	it('sorts "n/a" and "-" as if empty cells (first in ascending order)', done => {
		const items = ['café', 'apple', 'N/A', 'n.a.', '-', '','caffeine', 'Æ'];
		const expectedSortedRows = ['N/A', 'n.a.', '-', '', 'Æ', 'apple', 'café', 'caffeine'];

		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th>Localised Things</th>
					</tr>
				</thead>
				<tbody>
					${items.reduce((output, item) => output + `<tr><td>${item}</td></tr>`, '')}
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = Array.from(oTableEl.querySelectorAll('tbody tr td')).map(
				({ textContent }) => textContent
			);
			proclaim.deepEqual(rows, expectedSortedRows);
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});
		click('thead th button');
	});

	it('sorts strings from "<span>", "<a>", "<i>" tags and "<img>" tag "alt" attributes ', done => {
		const items = [
			'<a href="#">y</a>',
			'<span><a href="#">v</a></span>',
			'<i class="o-icons-icon">x</i>',
			'<img src="#" alt="w">',
			'<span>z</span>'
		];
		const expectedSortedRows = [
			'<span><a href="#">v</a></span>',
			'<img src="#" alt="w">',
			'<i class="o-icons-icon">x</i>',
			'<a href="#">y</a>',
			'<span>z</span>'
		];

		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th>Things</th>
					</tr>
				</thead>
				<tbody>
					${items.reduce((output, item) => output + `<tr><td>${item}</td></tr>`, '')}
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);

		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = Array.from(oTableEl.querySelectorAll('tbody tr td')).map(
				({ innerHTML }) => innerHTML
			);
			proclaim.deepEqual(rows, expectedSortedRows);
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});

		click('thead th button');
	});

	it('falls back to the "aria-label" or "title" of "<span>", "<a>", or "<i>" tags if a table cell has no content otherwise', done => {
		const items = [
			'<i class="o-icons-icon o-icons-icon--mail"><a href="#" title="d"></a>',
			'<span class="o-icons-icon o-icons-icon--tick">e</span>',
			'<span class="o-icons-icon o-icons-icon--tick" title="a"></span>',
			'<span class="o-icons-icon o-icons-icon--tick" aria-label="c"></span>',
			'<i class="o-icons-icon o-icons-icon--tick" title="z" aria-label="b"></i>'
		];
		const expectedSortValuesInOrder = [
			'a',
			'b',
			'c',
			'd',
			'e',
		];

		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th>Things</th>
					</tr>
				</thead>
				<tbody>
					${items.reduce((output, item) => output + `<tr><td>${item}</td></tr>`, '')}
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);

		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = Array.from(oTableEl.querySelectorAll('tbody tr td')).map(
				(td) => td.getAttribute('data-o-table-sort-value')
			);
			proclaim.deepEqual(rows, expectedSortValuesInOrder);
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});

		click('thead th button');
	});

	it('sorts custom data types according to a given formatter', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th data-o-table-data-type="emoji-time">Emoji Time</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>🌑</td>
					</tr>
					<tr>
						<td>🌤</td>
					</tr>
					<tr>
						<td>🌑</td>
					</tr>
					<tr>
						<td>🌤</td>
					</tr>
				</tbody>
			</table>
		`);
		OTable.setSortFormatterForType('emoji-time', (cell) => {
			const text = cell.textContent.trim();
			if (text === '🌑') {
				return 1;
			}
			if (text === '🌤') {
				return 2;
			}
			return 0;
		});
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);

		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = Array.from(oTableEl.querySelectorAll('tbody tr td')).map(
				(td) => td.textContent
			);
			proclaim.deepEqual(rows, ['🌑', '🌑', '🌤', '🌤']);
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});

		click('thead th button');
	});

	it('sorts localised strings alphabetically', done => {
		const items = ['café', 'apple', 'caffeine', 'Æ'];
		const expectedSortedRows = ['Æ', 'apple', 'café', 'caffeine'];

		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th>Localised Things</th>
					</tr>
				</thead>
				<tbody>
					${items.reduce((output, item) => output + `<tr><td>${item}</td></tr>`, '')}
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);

		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = Array.from(oTableEl.querySelectorAll('tbody tr td')).map(
				({ textContent }) => textContent
			);
			proclaim.deepEqual(rows, expectedSortedRows);
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});

		click('thead th button');
	});

	it('sorts localised strings alphabetically when the Intl.Collator API is not available', done => {
		const items = ['café', 'apple', 'caffeine', 'Æ'];
		const expectedSortedRows = ['Æ', 'apple', 'café', 'caffeine'];

		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th>Localised Things</th>
					</tr>
				</thead>
				<tbody>
					${items.reduce((output, item) => output + `<tr><td>${item}</td></tr>`, '')}
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');

		const intlBackup = Intl;
		delete global.Intl;
		testOTable = new OTable(oTableEl);

		oTableEl.addEventListener('oTable.sorted', () => {
			global.Intl = intlBackup;
			const rows = Array.from(oTableEl.querySelectorAll('tbody tr td')).map(
				({ textContent }) => textContent
			);
			proclaim.deepEqual(rows, expectedSortedRows);
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});

		click('thead th button');
	});

	it('sorts via data-o-table-sort-value numerically if it is set and numeric', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th>Things</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td data-o-table-sort-value=2>snowman</td>
					</tr>
					<tr>
						<td data-o-table-sort-value=3>42</td>
					</tr>
					<tr>
						<td data-o-table-sort-value=1>pangea</td>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);

		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr td');
			proclaim.equal(rows[0].textContent, 'pangea');
			proclaim.equal(rows[1].textContent, 'snowman');
			proclaim.equal(rows[2].textContent, '42');
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});

		click('thead th button');
	});

	it('sorts via data-o-table-sort-value alphabetically it is set, regardless of whether cell is <th> or <td>', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th>Things</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th data-o-table-sort-value="c">snowman</th>
					</tr>
					<tr>
						<th data-o-table-sort-value="a">42</th>
					</tr>
					<tr>
						<th data-o-table-sort-value="b">pangea</th>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);

		oTableEl.addEventListener('oTable.sorted', () => {
			const rows = oTableEl.querySelectorAll('tbody tr th');
			proclaim.equal(rows[0].textContent, '42');
			proclaim.equal(rows[1].textContent, 'pangea');
			proclaim.equal(rows[2].textContent, 'snowman');
			assertExpectedSort('thead th', 'ascending').then(() => done());
		});

		click('thead th button');
	});

	it('can be intercepted for a custom sort implementation', done => {
		sandbox.reset();
		sandbox.init();
		sandbox.setContents(`
			<table class="o-table" data-o-component="o-table">
				<thead>
					<tr>
						<th>Things</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th data-o-table-sort-value="c">snowman</th>
					</tr>
					<tr>
						<th data-o-table-sort-value="a">42</th>
					</tr>
					<tr>
						<th data-o-table-sort-value="b">pangea</th>
					</tr>
				</tbody>
			</table>
		`);
		oTableEl = document.querySelector('[data-o-component=o-table]');
		testOTable = new OTable(oTableEl);
		oTableEl.addEventListener('oTable.sorting', (event) => {
			event.preventDefault();
			// Column index, sort order, and table instance provided by the event.
			proclaim.equal(event.detail.columnIndex, 0);
			proclaim.equal(event.detail.sort, 'ascending');
			proclaim.equal(event.detail.instance, testOTable);
			// Sorted event can be fired.
			event.detail.instance.sorted({ columnIndex: event.detail.columnIndex, sort: event.detail.sort });
		});

		oTableEl.addEventListener('oTable.sorted', (event) => {
			const sortedHeading = event.detail.instance.getTableHeader(event.detail.columnIndex);
			// Standard sort has been intercepted, and "ascending" sort never happened.
			proclaim.equal(sortedHeading.getAttribute('aria-sort'), null);
			done();
		});
		click('thead th button');
	});

	describe('updates sort attributes when sorted', () => {
		let oTableElHeaders;

		const checkHeaderExpectations = function (sortedHeaderIndex, otherHeaderIndex, expectedAriaValue) {
			return new Promise((resolve) => {
				setTimeout(() => {
					sortedHeaderIndex = sortedHeaderIndex || 0;
					proclaim.equal(oTableElHeaders[sortedHeaderIndex].getAttribute('aria-sort'), expectedAriaValue);
					proclaim.equal(oTableElHeaders[otherHeaderIndex].getAttribute('aria-sort'), 'none');
					resolve(true);
				}, 50);
			});
		};

		beforeEach(() => {
			sandbox.reset();
			sandbox.init();
			sandbox.setContents(`
				<table class="o-table" data-o-component="o-table">
					<thead>
						<tr>
							<th>Things</th>
							<th>Other Things</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<th data-o-table-sort-value="c">snowman</th>
							<th data-o-table-sort-value="c">snowman</th>
						</tr>
						<tr>
							<th data-o-table-sort-value="a">42</th>
							<th data-o-table-sort-value="a">42</th>
						</tr>
						<tr>
							<th data-o-table-sort-value="b">pangea</th>
							<th data-o-table-sort-value="b">pangea</th>
						</tr>
					</tbody>
				</table>
			`);
			oTableEl = document.querySelector('[data-o-component=o-table]');
			testOTable = new OTable(oTableEl);
			oTableElHeaders = Array.from(oTableEl.querySelectorAll('thead th'));
		});

		afterEach(() => {
			oTableElHeaders = undefined;
		});

		it('by the first column, ascending', (done) => {
			const sortedHeaderIndex = 0;
			const otherHeaderIndex = 1;
			const sort = 'ascending';
			const expectedAriaValue = 'ascending';
			oTableEl.addEventListener('oTable.sorted', () => {
				checkHeaderExpectations(sortedHeaderIndex, otherHeaderIndex, expectedAriaValue).then(() => {
					done();
				});
			});
			testOTable.sortRowsByColumn(sortedHeaderIndex, sort);
		});

		it('by the second column, descending', (done) => {
			const sortedHeaderIndex = 1;
			const otherHeaderIndex = 0;
			const sort = 'descending';
			const expectedAriaValue = 'descending';
			oTableEl.addEventListener('oTable.sorted', () => {
				checkHeaderExpectations(sortedHeaderIndex, otherHeaderIndex, expectedAriaValue).then(() => {
					done();
				});
			});
			testOTable.sortRowsByColumn(sortedHeaderIndex, sort);
		});

		it('by the first column but with no sort specified', (done) => {
			const sortedHeaderIndex = 0;
			const sort = null;
			proclaim.throws(() => {
				testOTable.sortRowsByColumn(sortedHeaderIndex, sort);
			}, /Must be "ascending" or "descending"/);
			done();
		});

		it('by no column with no sort specified', (done) => {
			const sortedHeaderIndex = null;
			const sort = 'ascending';
			proclaim.throws(() => {
				testOTable.sortRowsByColumn(sortedHeaderIndex, sort);
			}, /Could not find header/);
			done();
		});
	});

});
