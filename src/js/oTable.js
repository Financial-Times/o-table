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

function addWrapper(tableRootElement) {
	// Wrap table elements in wrapper.
	let wrapEl = tableRootElement.closest('.o-table-wrapper');
	if (!wrapEl) {
		wrapEl = document.createElement('div');
		wrapEl.setAttribute('class', 'o-table-wrapper');
		wrapElement(tableRootElement, wrapEl);
	}
	return wrapEl;
}

function addContainer(tableRootElement) {
	// Wrap table wrappers in container.
	let containerElement = tableRootElement.closest('.o-table-container');
	if (!containerElement) {
		containerElement = document.createElement('div');
		containerElement.setAttribute('class', 'o-table-container');
		wrapElement(tableRootElement.closest('.o-table-wrapper'), containerElement);
	}
	return containerElement;
}

function wrapElement(targetEl, wrapEl) {
	const parentEl = targetEl.parentNode;
	parentEl.insertBefore(wrapEl, targetEl);
	wrapEl.appendChild(targetEl);
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
			this.listeners = [];
			this.isResponsive = false;
			this.rootEl.setAttribute('data-o-table--js', '');

			// Map "data-o-table-order" to "data-o-table-sort-value".
			const cellsWithOrder = this.rootEl.querySelectorAll('td[data-o-table-order], th[data-o-table-order]');
			if (cellsWithOrder.length > 0) {
				console.warn('o-table: "data-o-table-order" is deprecated, to provide a custom sort value for a table cell use "data-o-table-sort-value" instead.');
				cellsWithOrder.forEach(cell => {
					if (cell.getAttribute('data-o-table-order') !== null) {
						cell.setAttribute('data-o-table-sort-value', cell.getAttribute('data-o-table-order'));
					}
				});
			}

			const thead = this.rootEl.querySelector('thead');
			const tbody = this.rootEl.querySelector('tbody');
			this.tableHeaders = Array.from(thead.querySelectorAll('th'));
			this.tableRows = Array.from(tbody.getElementsByTagName('tr'));

			this.wrapper = this.rootEl.closest('.o-table-wrapper');
			this.container = this.rootEl.closest('.o-table-container');
			this.addControls();
			const controlOverlay = this.container.querySelector('.o-table-control-overlay');
			const fadeOverlay = this.container.querySelector('.o-table-fade-overlay');
			this.moreButton = controlOverlay.querySelector('.o-table-control--more');
			// start

			if (!this.expanded) {
				this.contractTable();
			}

			if (this.moreButton) {
				this.moreButton.addEventListener('click', () => {
					if (this.expanded) {
						this.contractTable();
					} else {
						this.expandTable();
					}
				});
			}

			controlOverlay.querySelector('.o-table-control--forward').addEventListener('click', () => {
				this.wrapper.scrollBy({
					left: (document.body.clientWidth / 2),
					behavior: 'smooth'
				});
			});

			controlOverlay.querySelector('.o-table-control--back').addEventListener('click', () => {
				this.wrapper.scrollBy({
					left: -(document.body.clientWidth / 2),
					behavior: 'smooth'
				});
			});

			if (window.IntersectionObserver && this.wrapper && controlOverlay) {
				const backButton = controlOverlay.querySelector('.o-table-control--back');
				const forwardButton = controlOverlay.querySelector('.o-table-control--forward');

				var controlFadeObserver = new IntersectionObserver((entries) => {
					entries.forEach(entry => {
						entry.target.classList.toggle('o-table-control--hide', entry.intersectionRatio !== 1);
					});
				}, {
					root: controlOverlay,
					threshold: 1.0,
					rootMargin: `-50px 0px ${ this.moreButton ? '50px' : '0px' } 0px`
				});
				controlFadeObserver.observe(backButton);
				controlFadeObserver.observe(forwardButton);

				let scrollTimeout = false;
				this.wrapper.addEventListener('scroll', function() {
					if (! scrollTimeout) {
						scrollTimeout = true;
						setTimeout(function() {
							this._updateControls(controlOverlay);
							scrollTimeout = false;
						}.bind(this), 33);
					}
				}.bind(this));

				setTimeout(function() {
					this._updateControls(controlOverlay);
				}.bind(this), 1); // Allow for table to be wraped.
			}
			// end
			this.tableHeaders.forEach((th, columnIndex) => {
				// Do not sort headers with attribute.
				if (th.hasAttribute('data-o-table-heading-disable-sort')) {
					return false;
				}

				th.setAttribute('tabindex', "0");

				const listener = this._sortByColumn(columnIndex);
				this.listeners.push(listener);
				th.addEventListener('click', listener);
				th.addEventListener('keydown', (event) => {
					const ENTER = 13;
					const SPACE = 32;
					if ('code' in event) {
						// event.code is not fully supported in the browsers we care about but
						// use it if it exists
						if (event.code === "Space" || event.code === "Enter") {
							listener(event);
						}
					} else if (event.keyCode === ENTER || event.keyCode === SPACE) {
						// event.keyCode has been deprecated but there is no alternative
						listener(event);
					}
				});
			});

			// "o-table--responsive-flat" configuration only works when there is a
			// `<thead>` block containing the table headers. If there are no headers
			// available, the `responsive-flat` class needs to be removed to prevent
			// headings being hidden.
			if (this.rootEl.getAttribute('data-o-table-responsive') === 'flat' && this.tableHeaders.length > 0) {
				this.isResponsive = true;
			} else {
				this.rootEl.classList.remove('o-table--responsive-flat');
			}

			if (this.isResponsive) {
				OTable._duplicateHeaders(this.tableRows, this.tableHeaders);
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

	addControls() {
		if (!this.wapper || !this.container) {
			this.wrap();
		}
		this.container.insertAdjacentHTML('beforeend', `
			<div class="o-table-fade-overlay"></div>
			<div class="o-table-control-overlay o-table-control-overlay--dock">
				<div aria-hidden="true" class="o-table-control o-table-control--back">
					<button class="o-buttons o-buttons--primary o-buttons--big o-buttons-icon o-buttons-icon--icon-only o-buttons-icon--arrow-left"></button>
				</div>

				<div aria-hidden="true" class="o-table-control o-table-control--forward">
					<button class="o-buttons o-buttons--primary o-buttons--big o-buttons-icon o-buttons-icon--icon-only o-buttons-icon--arrow-right"></button>
				</div>

				<div aria-hidden="true" class="o-table-control o-table-control--more">
					<button class="o-buttons o-buttons--primary o-buttons--big">Show fewer</button>
				</div>
			</div>
		`);
	}

	contractTable() {
		this.expanded = false;
		const hiddenRows = this.hiddenRows;
		const originalButtonTopOffset = this.moreButton.getBoundingClientRect().top;
		// Calculate contracted table height.
		// Extra height to tease half of the first hidden row.
		const tableHeight = this.rootEl.getBoundingClientRect().height;
		const hiddenRowsHeight = hiddenRows.reduce((accumulatedHeight, row) => {
			return accumulatedHeight + row.getBoundingClientRect().height;
		}, 0);
		const moreButtonheight = this.moreButton.getBoundingClientRect().height;
		const extraHeight = (hiddenRows[0] ? hiddenRows[0].getBoundingClientRect().height / 2 : 0);
		const contractedHeight = tableHeight + moreButtonheight + extraHeight - hiddenRowsHeight;
		// Contract table.
		window.requestAnimationFrame(() => {
			this._updateRowVisibility();
			this.wrapper.style.height = `${contractedHeight}px`;
			this.moreButton.querySelector('button').textContent = `Show more`;
			this.container.classList.remove('o-table-container--expanded');
			// Keep more/fewer button in viewport when contracting table.
			window.scrollBy({
				top: this.moreButton.getBoundingClientRect().top - originalButtonTopOffset,
			});
		});
	}

	expandTable() {
		this.expanded = true;
		window.requestAnimationFrame(() => {
			this.container.classList.add('o-table-container--expanded');
			this.moreButton.querySelector('button').textContent = 'Show fewer';
			this.wrapper.style.height = '';
			this.tableRows.forEach(row => row.setAttribute('aria-hidden', false));
		});
	}

	get contractedRowCount() {
		const configuredRowCount = this.rootEl.getAttribute('data-o-table-contracted-row-count');
		const minRowCount = isNaN(parseInt(configuredRowCount)) ? 0 : parseInt(configuredRowCount);
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
			th.removeEventListener('click', this.listeners[columnIndex]);
			th.removeEventListener('keydown', this.listeners[columnIndex]);
		});
	}

	/**
	 * Sorts the table by a specific column
	 * @param {number} index The index of the column to sort the table by
	 * @param {bool} sortAscending Which direction to sort in, ascending or descending
	 * @param {bool} isNumericValue Deprecated: Set `type` instead.
	 * @param {string} type What type of data the column holds to enable sorting of numeric values, dates, etc.
	 * @returns undefined
	 */
	sortRowsByColumn(index, sortAscending, isNumericValue = null, type = null) {
		if (isNumericValue !== null) {
			console.warn(`"sortRowsByColumn" argument "isNumericValue" is deprecated. Set "type" to a valid type such as "numeric" or "text". More specific types are listed in the README https://github.com/Financial-Times/o-table#sorting.`);
		}
		// If type is not set but deprecated "isNumericValue" is, set the type to numeric.
		if (isNumericValue) {
			type = type || 'numeric';
		}
		const tbody = this.rootEl.querySelector('tbody');
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

		window.requestAnimationFrame(() => {
			this.tableRows.forEach(function (row) {
				tbody.appendChild(row);
			});
			this._updateRowVisibility();
			this.sorted(index, (sortAscending ? 'ASC' : 'DES'));
		});
	}

	/**
	 * Indicated that the table has been sorted by firing by a custom sort implementation.
	 * Fires the `oTable.sorted` event.
	 *
	 * @public
	 * @param {number|null} columnIndex - The index of the currently sorted column, if any.
	 * @param {string|null} sort - The type of sort i.e. ASC or DES, if any.
	 */
	sorted(columnIndex, sort) {
		this._updateSortAttributes(columnIndex, sort);
		this.dispatch('sorted', {
			sort,
			columnIndex,
			oTable: this
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
		this.rootEl.removeAttribute('data-o-table--js');
		this.removeEventListeners();
		delete this.rootEl;
	}

	/**
	 * @private
	 * @param {Number} columnIndex
	 */
	_sortByColumn(columnIndex) {
		return function (event) {
			const currentSort = event.currentTarget.getAttribute('aria-sort');
			const sort = this.rootEl.getAttribute('data-o-table-order') === null || currentSort === "none" || currentSort === "descending" ? 'ASC' : 'DES';

			/**
			 * Check if sorting has been cancelled on this table in favour of a custom implementation.
			 *
			 * The return value is false if event is cancelable and at least one of the event handlers
			 * which handled this event called Event.preventDefault(). Otherwise it returns true.
			 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
			 */
			const customSort = !event.currentTarget.dispatchEvent(new CustomEvent('oTable.sorting', {
				detail: {
					sort,
					columnIndex,
					oTable: this
				},
				bubbles: true,
				cancelable: true
			}));

			if (!customSort) {
				const columnDataType = event.currentTarget.getAttribute('data-o-table-data-type');
				this.sortRowsByColumn(columnIndex, sort === "ASC", null, columnDataType);
			}

			/**
			 * Update aria attributes to provide immediate feedback.
			 *
			 * This is called again by the `sorted` method to assure accuracy.
			 * I.e. if a sort fails previous sort attributes can be restored via the `sorted` method.
			 */
			this._updateSortAttributes(columnIndex, sort);

		}.bind(this);
	}

	/**
	 * Update the aria sort attributes on a sorted table.
	 * Useful to reset sort attributes in the case of a custom sort implementation failing.
	 * E.g. One which relies on the network.
	 *
	 * @private
	 * @param {number|null} columnIndex - The index of the currently sorted column, if any.
	 * @param {string|null} sort - The type of sort i.e. ASC or DES, if any.
	 */
	_updateSortAttributes(columnIndex, sort) {
		let ariaSort;
		switch (sort) {
			case 'ASC':
				ariaSort = 'ascending';
				break;
			case 'DES':
				ariaSort = 'descending';
				break;
			default:
				ariaSort = 'none';
				break;
		}
		// Set aria attributes.
		window.requestAnimationFrame(() => {
			const sortedHeader = this.getTableHeader(columnIndex);
			if (!sortedHeader || sortedHeader.getAttribute('aria-sort') !== ariaSort) {
				this.tableHeaders.forEach((header) => {
					const headerSort = (header === sortedHeader ? ariaSort : 'none');
					header.setAttribute('aria-sort', headerSort);
				});
				this.rootEl.setAttribute('data-o-table-order', sort);
			}
		});
	}

	_updateControls(controlOverlay) {
		const forwardButton = controlOverlay.querySelector('.o-table-control--forward');
		const backButton = controlOverlay.querySelector('.o-table-control--back');

		const fromEnd = this.wrapper.scrollWidth - this.wrapper.clientWidth - this.wrapper.scrollLeft;
		const fromStart = this.wrapper.scrollLeft;

		this.container.style.setProperty('--o-table-fade-from-end', `${Math.min(fromEnd, 10)}px`);
		this.container.style.setProperty('--o-table-fade-from-start', `${Math.min(fromStart, 10)}px`);

		if (fromEnd === 0) {
			forwardButton.querySelector('button').setAttribute('disabled', true);
		} else {
			forwardButton.querySelector('button').removeAttribute('disabled');
		}

		if (fromStart === 0) {
			backButton.querySelector('button').setAttribute('disabled', true);
		} else {
			backButton.querySelector('button').removeAttribute('disabled');
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

	static wrap() {
		const tableElements = document.querySelectorAll('.o-table');
		tableElements.forEach(element => {
			addWrapper(element);
			addContainer(element);
		});
	}

	wrap() {
		this.wrapper = addWrapper(this.rootEl) || this.wrapper;
		this.container = addContainer(this.rootEl) || this.container;
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
