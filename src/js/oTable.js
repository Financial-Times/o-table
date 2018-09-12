const SortFormatter = require('./sort-formatter');
const tableSortFormatter = new SortFormatter();

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

class OTable {
	/**
	 * Initialises o-table component(s).
	 *
	 * @param {(HTMLElement|string)} [el=document.body] - o-table element, or element where to search for an o-table element to initialise. You can pass an HTMLElement or a selector string
	 * @returns {OTable} - A single OTable instance
	 */
	constructor(rootEl) {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		if (rootEl.getAttribute('data-o-component') === "o-table") {
			this.rootEl = rootEl;
		} else {
			this.rootEl = rootEl.querySelector('[data-o-component~="o-table"]');
		}

		if (this.rootEl !== undefined) {
			this._sortListeners = [];

			this.thead = this.rootEl.querySelector('thead');
			this.tbody = this.rootEl.querySelector('tbody');
			this.tableHeaders = this.thead ? Array.from(this.thead.querySelectorAll('th')) : [];
			this.tableRows = this.tbody ? Array.from(this.tbody.getElementsByTagName('tr')) : [];

			this._addSortButtonsToHeaders();
			this._addControls();

			// "o-table--responsive-flat" configuration only works when there is a
			// `<thead>` block containing the table headers. If there are no headers
			// available, the `responsive-flat` class needs to be removed to prevent
			// headings being hidden.
			if (this.rootEl.getAttribute('data-o-table-responsive') === 'flat' && this.tableHeaders.length > 0) {
				OTable._duplicateHeaders(this.tableRows, this.tableHeaders);
			} else {
				this.rootEl.classList.remove('o-table--responsive-flat');
			}

			this.dispatch('ready', {
				oTable: this
			});
		}
	}

	_updateRowVisibility() {
		const hiddenRows = this.hiddenRows;
		this.tableRows.forEach((row) => {
			row.setAttribute('aria-hidden', hiddenRows && hiddenRows.includes(row) ? 'true' : 'false');
		});
	}

	_addSortButtonsToHeaders() {
		if (this.tableHeaders.length === 0) {
			return;
		}
		this.tableHeaders.forEach((th, columnIndex) => {
			// Do not sort headers with attribute.
			if (th.hasAttribute('data-o-table-heading-disable-sort')) {
				return;
			}
			const heading = th.textContent;
			const sortButton = document.createElement('button');
			sortButton.textContent = heading;
			// In VoiceOver, button `aria-label` when moving to a new column to read td cells.
			sortButton.setAttribute('title', `sort table by ${heading}`);
			th.innerHTML = '';
			th.appendChild(sortButton);
			const listener = function() {
				const currentSort = th.getAttribute('aria-sort');
				const sortOrder = [null, 'none', 'descending'].includes(currentSort) ? 'ascending' : 'descending';

				/**
				 * Check if sorting has been cancelled on this table in favour of a custom implementation.
				 *
				 * The return value is false if event is cancelable and at least one of the event handlers
				 * which handled this event called Event.preventDefault(). Otherwise it returns true.
				 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
				 */
				const customSort = !th.dispatchEvent(new CustomEvent('oTable.sorting', {
					detail: {
						sort: sortOrder,
						columnIndex,
						oTable: this
					},
					bubbles: true,
					cancelable: true
				}));

				// Add class for immediate visual feedback (only update aria when table has sorted successfully).
				th.classList.add(`o-table-sorting-${sortOrder}`);

				if (!customSort) {
					this.sortRowsByColumn(columnIndex, sortOrder === "ascending");
				}
			}.bind(this);
			this._sortListeners.push(listener);
			sortButton.addEventListener('click', listener);
		});
	}

	_addControls() {
		this.wrapper = this.rootEl.closest('.o-table-wrapper');
		this.container = this.rootEl.closest('.o-table-container');

		if (this.controls || !this.wrapper || !this.container) {
			return;
		}

		this.container.insertAdjacentHTML('beforeend', `
			<div class="o-table-fade-overlay"></div>
			<div class="o-table-control-overlay">
				<div class="o-table-control o-table-control--back">
					<button class="o-buttons o-buttons--primary o-buttons--big o-buttons-icon o-buttons-icon--icon-only o-buttons-icon--arrow-left"></button>
				</div>

				<div class="o-table-control o-table-control--forward">
					<button class="o-buttons o-buttons--primary o-buttons--big o-buttons-icon o-buttons-icon--icon-only o-buttons-icon--arrow-right"></button>
				</div>

				${this.hiddenRows.length !== 0 ? `
					<div class="o-table-control o-table-control--more">
						<button class="o-buttons o-buttons--primary o-buttons--big">Show fewer</button>
					</div>
				` : ''}
			</div>
		`);


		this.controls = {
			overlay: this.container.querySelector('.o-table-control-overlay'),
			moreButton: this.container.querySelector('.o-table-control--more'),
			forwardButton: this.container.querySelector('.o-table-control--forward'),
			backButton: this.container.querySelector('.o-table-control--back')
		};

		if (this.hiddenRows.length > 0 && !this.expanded) {
			this.contractTable();
		}

		if (this.controls.moreButton) {
			this.controls.moreButton.addEventListener('click', () => {
				if (this.expanded) {
					this.contractTable();
				} else {
					this.expandTable();
				}
			});
		}

		this.controls.forwardButton.addEventListener('click', () => {
			this.wrapper.scrollBy({
				left: (document.body.clientWidth / 2),
				behavior: 'smooth'
			});
		});

		this.controls.backButton.addEventListener('click', () => {
			this.wrapper.scrollBy({
				left: -(document.body.clientWidth / 2),
				behavior: 'smooth'
			});
		});

		if (window.IntersectionObserver && this.wrapper && this.controls.overlay) {
			const controlFadeObserver = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					entry.target.classList.toggle('o-table-control--hide', entry.intersectionRatio !== 1);
				});
			}, {
				root: this.controls.overlay,
				threshold: 1.0,
				rootMargin: `-50px 0px ${this.controls.moreButton ? '0px' : '-10px'} 0px`
			});
			controlFadeObserver.observe(this.controls.backButton);
			controlFadeObserver.observe(this.controls.forwardButton);

			let scrollTimeout = false;
			this.wrapper.addEventListener('scroll', function () {
				if (!scrollTimeout) {
					scrollTimeout = true;
					setTimeout(function () {
						this._updateControls();
						scrollTimeout = false;
					}.bind(this), 33);
				}
			}.bind(this));

			let resizeTimeout = false;
			window.addEventListener('resize', function () {
				if (!resizeTimeout) {
					resizeTimeout = true;
					setTimeout(function () {
						this._updateControls();
						resizeTimeout = false;
					}.bind(this), 500);
				}
			}.bind(this));

			setTimeout(function () {
				this._updateControls();
			}.bind(this), 1); // Allow for table to be wraped.
		}
	}

	contractTable() {
		this.expanded = false;
		const moreButton = this.controls ? this.controls.moreButton.querySelector('button') : null;
		const hiddenRows = this.hiddenRows;
		const originalButtonTopOffset = this.controls.moreButton.getBoundingClientRect().top;
		// Calculate contracted table height.
		// Extra height to tease half of the first hidden row.
		const tableHeight = this.rootEl.getBoundingClientRect().height;
		const hiddenRowsHeight = hiddenRows.reduce((accumulatedHeight, row) => {
			return accumulatedHeight + row.getBoundingClientRect().height;
		}, 0);
		const extraHeight = (hiddenRows[0] ? hiddenRows[0].getBoundingClientRect().height / 2 : 0);
		const contractedHeight = tableHeight + extraHeight - hiddenRowsHeight;
		// Contract table.
		window.requestAnimationFrame(() => {
			this._updateRowVisibility();
			this.wrapper.style.height = `${contractedHeight}px`;
			this.container.classList.add('o-table-container--contracted');
			if (moreButton) {
				moreButton.textContent = 'Show more';
				// Keep more/fewer button in viewport when contracting table.
				window.scrollBy({
					top: this.controls.moreButton.getBoundingClientRect().top - originalButtonTopOffset,
				});
			}
		});
	}

	expandTable() {
		this.expanded = true;
		const moreButton = this.controls ? this.controls.moreButton.querySelector('button') : null;
		window.requestAnimationFrame(() => {
			this.container.classList.remove('o-table-container--contracted');
			if (moreButton) {
				moreButton.textContent = 'Show fewer';
			}
			this.wrapper.style.height = '';
			this.tableRows.forEach(row => row.setAttribute('aria-hidden', false));
		});
	}

	get contractedRowCount() {
		const configuredRowCount = this.rootEl.getAttribute('data-o-table-contracted-row-count');
		const minRowCount = isNaN(parseInt(configuredRowCount, 10)) ? 0 : parseInt(configuredRowCount, 10);
		return Math.min(this.tableRows.length, minRowCount);
	}

	get hiddenRows() {
		return this.expanded ? [] : this.tableRows.slice(this.contractedRowCount, this.tableRows.length);
	}

	get expanded() {
		const configuredValue = this.rootEl.getAttribute('data-o-table-expanded');
		return Boolean(configuredValue !== 'false');
	}

	set expanded(value) {
		this.rootEl.setAttribute('aria-expanded', value);
		this.rootEl.setAttribute('data-o-table-expanded', Boolean(value));
	}

	/**
	 * Helper function to dispatch namespaced events, namespace defaults to oTable
	 * @param  {String} event
	 * @param  {Object} data={}
	 * @param  {String} namespace='oTable'
	 */
	dispatch(event, data = {}, namespace = 'oTable') {
		this._timeoutID = setTimeout(() => {
			this.rootEl.dispatchEvent(new CustomEvent(namespace + '.' + event, {
				detail: data,
				bubbles: true
			}));
		}, 0);
	}

	/**
	 * Gets a table header for a given column index.
	 *
	 * @public
	 * @returns {element|null} - The header element for the requested column index.
	 */
	getTableHeader(columnIndex) {
		return this.tableHeaders[columnIndex] || null;
	}

	/**
	 * Helper function to remove all event handlers which were added during instantiation of the component
	 * @returns {undefined}
	 */
	removeEventListeners() {
		this.tableHeaders.forEach((th, columnIndex) => {
			th.querySelector('button').removeEventListener('click', this._sortListeners[columnIndex]);
		});
	}

	/**
	 * Sorts the table by a specific column
	 * @param {number} index The index of the column to sort the table by
	 * @param {bool} sortAscending Which direction to sort in, ascending or descending
	 * @returns undefined
	 */
	sortRowsByColumn(index, sortAscending) {
		const tableHeaderElement = this.getTableHeader(index);
		const type = tableHeaderElement.getAttribute('data-o-table-data-type') || undefined;

		const intlCollator = getIntlCollator();
		this.tableRows.sort(function (a, b) {
			let aCol = a.children[index];
			let bCol = b.children[index];
			aCol = tableSortFormatter.formatCell({ cell: aCol, type });
			bCol = tableSortFormatter.formatCell({ cell: bCol, type });
			if (sortAscending) {
				return ascendingSort(aCol, bCol, intlCollator);
			} else {
				return descendingSort(aCol, bCol, intlCollator);
			}
		});

		window.requestAnimationFrame(function() {
			this.tableRows.forEach(function (row) {
				this.tbody.appendChild(row);
			}.bind(this));
			this._updateRowVisibility();
			this.sorted(index, (sortAscending ? 'ascending' : 'descending'));
		}.bind(this));
	}

	/**
	 * Indicated that the table has been sorted by firing by a custom sort implementation.
	 * Fires the `oTable.sorted` event.
	 *
	 * @public
	 * @param {number|null} columnIndex - The index of the currently sorted column, if any.
	 * @param {string|null} sort - The type of sort i.e. ascending or descending, if any.
	 */
	sorted(columnIndex, sort) {
		// Set aria attributes.
		sort = sort || 'none';
		window.requestAnimationFrame(() => {
			const sortedHeader = this.getTableHeader(columnIndex);
			this.tableHeaders.forEach((header) => {
				const headerSort = (header === sortedHeader ? sort : 'none');
				header.setAttribute('aria-sort', headerSort);
				header.classList.remove(`o-table-sorting-ascending`);
				header.classList.remove(`o-table-sorting-descending`);
			});
			this.dispatch('sorted', {
				sort,
				columnIndex,
				oTable: this
			});
		});
	}

	/**
	 * Destroys the instance, removing any event listeners that were added during instatiation of the component
	 * @returns undefined
	 */
	destroy() {
		if (this._timeoutID !== undefined) {
			clearTimeout(this._timeoutID);
			this._timeoutID = undefined;
		}
		this.removeEventListeners();
		delete this.rootEl;
	}

	_updateControls() {
		const fromEnd = this.wrapper.scrollWidth - this.wrapper.clientWidth - this.wrapper.scrollLeft;
		const fromStart = this.wrapper.scrollLeft;

		this.container.style.setProperty('--o-table-fade-from-end', `${Math.min(fromEnd, 10)}px`);
		this.container.style.setProperty('--o-table-fade-from-start', `${Math.min(fromStart, 10)}px`);

		if (fromEnd === 0 && fromStart === 0) {
			this.container.classList.remove('o-table-control-overlay--dock');
			this.controls.forwardButton.style.display = 'none';
			this.controls.backButton.style.display = 'none';
		} else {
			if (this.hiddenRows.length !== 0 && this.controls.moreButton) {
				this.container.classList.add('o-table-control-overlay--dock');
			} else {
				this.container.classList.remove('o-table-control-overlay--dock');
			}
			this.controls.forwardButton.style.display = '';
			this.controls.backButton.style.display = '';
		}

		if (fromEnd === 0) {
			this.controls.forwardButton.querySelector('button').setAttribute('disabled', true);
		} else {
			this.controls.forwardButton.querySelector('button').removeAttribute('disabled');
		}

		if (fromStart === 0) {
			this.controls.backButton.querySelector('button').setAttribute('disabled', true);
		} else {
			this.controls.backButton.querySelector('button').removeAttribute('disabled');
		}
	}

	/**
	 * Initialises all o-table components inside the element passed as the first parameter
	 *
	 * @access public
	 * @param {(HTMLElement|string)} [el=document.body] - Element where to search for o-table components. You can pass an HTMLElement or a selector string
	 * @returns {Array|OTable} - An array of OTable instances or a single OTable instance
	 */
	static init(el = document.body) {
		if (!(el instanceof HTMLElement)) {
			el = document.querySelector(el);
		}
		if (/\bo-table\b/.test(el.getAttribute('data-o-component'))) {
			return new OTable(el);
		}
		const tableEls = Array.from(el.querySelectorAll('[data-o-component~="o-table"]'));
		return tableEls.map(el => {
			return new OTable(el);
		});
	}

	/**
	 * Set a custom sort filter for a given table cell data type.
	 * @see {@link SortFormatter#setFormatter} for `formatFunction` details.
	 * @access public
	 */
	static setSortFormatterForType(type, formatFunction) {
		tableSortFormatter.setFormatter(type, formatFunction);
	}

	/**
	 * Duplicate the table headers into each row
	 * For use with responsive tables
	 *
	 * @private
	 * @param  {array} rows Table rows
	 */
	static _duplicateHeaders(rows, headers) {
		rows.forEach((row) => {
			const data = Array.from(row.getElementsByTagName('td'));
			data.forEach((td, dataIndex) => {
				td.parentNode.insertBefore(headers[dataIndex].cloneNode(true), td);
			});
		});
	}
}

module.exports = OTable;
