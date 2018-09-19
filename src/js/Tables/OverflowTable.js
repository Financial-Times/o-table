import BaseTable from './BaseTable';

class OverflowTable extends BaseTable {

	/**
	 * Initialises an `o-table` component.
	 *
	 * @param {HTMLElement} rootEl - The `o-table` element.
	 * @param {TableSorter} sorter
	 * @param {Object} opts
	 * @returns {OverflowTable}
	 */
	constructor(rootEl, sorter, opts = {}) {
		super(rootEl, sorter, opts);
		this._opts = Object.assign({
			expanded: this.rootEl.hasAttribute('data-o-table-expanded') ? this.rootEl.getAttribute('data-o-table-expanded') !== 'false' : null
		}, opts);
		this._addSortButtons();
		if (this._hasScrollWrapper()) {
			this._setupScroll();
		}
		if (this._tableCanExpand()) {
			this._setupExpander();
		}
		this._ready();
		return this;
	}

	/**
	 * Check if the table is expanded (true) or collapsed (false).
	 * @returns {Bool}
	 */
	isExpanded() {
		const value = this.rootEl.getAttribute('data-o-table-expanded');
		return Boolean(value !== 'false');
	}

	/**
	 * Hides table rows as configured by `data-o-table-minimum-row-count` and `data-o-table-expanded`.
	 * @returns undefined
	 */
	contractTable() {
		const moreButton = this.controls ? this.controls.moreButton.querySelector('button') : null;
		const rowsToHide = this._rowsToHide;
		const originalButtonTopOffset = this.controls.moreButton.getBoundingClientRect().top;
		// Calculate contracted table height.
		// Extra height to tease half of the first hidden row.
		const tableHeight = this.rootEl.getBoundingClientRect().height;
		const rowsToHideHeight = rowsToHide.reduce((accumulatedHeight, row) => {
			return accumulatedHeight + row.getBoundingClientRect().height;
		}, 0);
		const extraHeight = (rowsToHide[0] ? rowsToHide[0].getBoundingClientRect().height / 2 : 0);
		const contractedHeight = tableHeight + extraHeight - rowsToHideHeight;
		// Contract table.
		window.requestAnimationFrame(() => {
			this._updateRowVisibility();
			this.rootEl.setAttribute('aria-expanded', false);
			this.rootEl.setAttribute('data-o-table-expanded', false);
			this.wrapper.style.height = `${contractedHeight}px`;
			this.container.classList.remove('o-table-container--expanded');
			this.container.classList.add('o-table-container--contracted');
			if (moreButton) {
				moreButton.textContent = 'Show more';
				// Keep more/fewer button in viewport when contracting table.
				// Using `window.scroll(x-coord, y-coord)` as IE11 did not scroll
				// correctly with `window.scroll(options)`.
				const top = window.pageYOffset + this.controls.moreButton.getBoundingClientRect().top - originalButtonTopOffset;
				window.scroll(null, top);
			}
			this._updateControls();
		});
	}

	/**
	 * Shows all table rows if any have been hidden.
	 * @returns undefined
	 */
	expandTable() {
		const moreButton = this.controls ? this.controls.moreButton.querySelector('button') : null;
		window.requestAnimationFrame(() => {
			this.container.classList.remove('o-table-container--contracted');
			this.container.classList.add('o-table-container--expanded');
			if (moreButton) {
				moreButton.textContent = 'Show fewer';
			}
			this.wrapper.style.height = '';
			this.tableRows.forEach(row => row.setAttribute('aria-hidden', false));
			this.rootEl.setAttribute('aria-expanded', true);
			this.rootEl.setAttribute('data-o-table-expanded', true);
			this._updateControls();
		});
	}

	/**
	 * Performs post-sort actions such as updating row visibility and firing a `oTable.sorted` event.
	 * Required as the sort event can be intercepted for a custom implementation.
	 *
	 * @param {Object} sortDetail An object containing information about the sort.
	 * @param {Number} sortDetail.columnIndex The index of the column which has been sorted.
	 * @param {String} sortDetail.sortAscending The order of the sort i.e. ascending or descending.
	 * @returns undefined
	 */
	sorted({columnIndex, sortOrder}) {
		window.requestAnimationFrame(() => {
			this._updateRowVisibility();
			super.sorted({ columnIndex, sortOrder });
		});
	}

	/**
	 * Check if the table supports the expand/contract feature.
	 * @returns {Bool}
	 */
	_tableCanExpand() {
		return typeof this._opts.expanded === 'boolean' && (this._minimumRowCount < this.tableRows.length);
	}

	/**
	 * Check if the table has the wrapper element.
	 * Is there is no wrapper assume the user intentionally omitted it,
	 * as they do not want a scrolling table.
	 * @returns {Bool}
	 */
	_hasScrollWrapper() {
		return Boolean(this.wrapper);
	}

	/**
	 * Update row aria attributes to show/hide them.
	 * E.g. After performing a sort, rows which where hidden in the colapsed table may have become visible.
	 * @returns {undefined}
	 */
	_updateRowVisibility() {
		const hiddenRows = this._hiddenRows;
		this.tableRows.forEach((row) => {
			row.setAttribute('aria-hidden', hiddenRows && hiddenRows.indexOf(row) !== -1 ? 'true' : 'false');
		});
	}

	/**
	 * Add controls such as the back, forward, "show more" buttons to DOM,
	 * plus wrappers needed for them to function.
	 * @returns {undefined}
	 */
	_addControlsToDom() {
		if (this.container && !this.controls) {

			this.container.insertAdjacentHTML('beforeend', `
				${this._hasScrollWrapper() ? `
					<div class="o-table-fade-overlay" style="display: none;"></div>
				` : ''}
				<div class="o-table-control-overlay" style="display: none;">
					${this._hasScrollWrapper() && OverflowTable._supportsArrows() ? `
						<div class="o-table-control o-table-control--back">
							<button class="o-buttons o-buttons--primary o-buttons--big o-buttons-icon o-buttons-icon--icon-only o-buttons-icon--arrow-left"></button>
						</div>
					` : ''}

					${this._hasScrollWrapper() && OverflowTable._supportsArrows() ? `
						<div class="o-table-control o-table-control--forward">
							<button class="o-buttons o-buttons--primary o-buttons--big o-buttons-icon o-buttons-icon--icon-only o-buttons-icon--arrow-right"></button>
						</div>
					` : ''}

					${this._tableCanExpand() ? `
						<div class="o-table-control o-table-control--more">
							<button class="o-buttons o-buttons--primary o-buttons--big">Show fewer</button>
						</div>
					` : ''}
				</div>
			`);

			this.controls = {
				controlsOverlay: this.container.querySelector('.o-table-control-overlay'),
				fadeOverlay: this.container.querySelector('.o-table-fade-overlay'),
				moreButton: this.container.querySelector('.o-table-control--more'),
				forwardButton: this.container.querySelector('.o-table-control--forward'),
				backButton: this.container.querySelector('.o-table-control--back')
			};

			this._updateControls();
			window.requestAnimationFrame(function () {
				this.controls.controlsOverlay.style.display = '';
				this.controls.fadeOverlay.style.display = '';
			}.bind(this));
		}
	}

	/**
	 * Add functionality to improve the experience when scrolling a table,
	 * such as showing forward/back buttons to indicate that scroll is possible.
	 * @returns {undefined}
	 */
	_setupScroll() {
		// Can not add controls without a container.
		// Does not add automatically for performace, but could.
		if (!this.container) {
			console.warn(
				'Controls to scroll table left/right could not be added to "o-table" as it is missing markup.' +
				'Please add the container element according to the documentation https://registry.origami.ft.com/components/o-table.',
				{ table: this.rootEl }
			);
			return;
		}

		// Add table controls (e.g. left/right button).
		if (!this.controls) {
			this._addControlsToDom();
		}

		// Add forward button behaviour.
		if (this.controls.forwardButton) {
			const scrollForward = function () {
				this.wrapper.scrollBy({
					left: (document.body.clientWidth / 2),
					behavior: 'smooth'
				});
			}.bind(this);
			this.controls.forwardButton.addEventListener('click', scrollForward);
			this._listeners.push({
				element: this.controls.forwardButton,
				scrollForward,
				type: 'click'
			});
		}

		// Add back button behaviour.
		if (this.controls.backButton) {
			const scrollBackward = function () {
				this.wrapper.scrollBy({
					left: -(document.body.clientWidth / 2),
					behavior: 'smooth'
				});
			}.bind(this);
			this.controls.backButton.addEventListener('click', scrollBackward);
			this._listeners.push({
				element: this.controls.backButton,
				scrollBackward,
				type: 'click'
			});
		}


		if (this.controls.controlsOverlay && window.IntersectionObserver) {
			// Fade forward/back buttons at start and end of table.
			const arrowFadeObserverConfig = {
				root: this.controls.controlsOverlay,
				threshold: 1.0,
				rootMargin: `-50px 0px ${this.controls.moreButton ? '0px' : '-10px'} 0px`
			};
			const arrowFadeObserver = new IntersectionObserver(entries => {
				entries.forEach(entry => {
					entry.target.classList.toggle('o-table-control--hide', entry.intersectionRatio !== 1);
				});
			}, arrowFadeObserverConfig);
			if (this.controls.backButton) {
				arrowFadeObserver.observe(this.controls.backButton);
			}
			if (this.controls.forwardButton) {
				arrowFadeObserver.observe(this.controls.forwardButton);
			}
		}

		if (this.wrapper) {
			let updateControls = false;
			const updateControlsRateLimited = function () {
				if (!updateControls) {
					updateControls = true;
					setTimeout(function () {
						this._updateControls();
						updateControls = false;
					}.bind(this), 33);
				}
			};
			// On scroll enable/Disable forward/back buttons at edge of table.
			this.wrapper.addEventListener('scroll', updateControlsRateLimited.bind(this));
			this._listeners.push({element: this.wrapper, updateControlsRateLimited, type: 'scroll'});
			// On resize enable/Disable forward/back buttons at edge of table.
			window.addEventListener('resize', updateControlsRateLimited.bind(this));
			this._listeners.push({element: window, updateControlsRateLimited, type: 'resize'});
		}
	}

	/**
	 * Add hide/show functionality for long tables.
	 * @returns {undefined}
	 */
	_setupExpander() {
		if (!this.container) {
			console.warn(
				'Controls to expand/contract the table could not be added to "o-table" as it is missing markup.' +
				'Please add the container element according to the documentation https://registry.origami.ft.com/components/o-table.',
				{ table: this.rootEl }
			);
			return;
		}

		// Add table controls (e.g. "more" button).
		if (!this.controls) {
			this._addControlsToDom();
		}

		if (this.controls.moreButton) {
			const toggleExpanded = function () {
				if (this.isExpanded()) {
					this.contractTable();
				} else {
					this.expandTable();
				}
			}.bind(this);
			this.controls.moreButton.addEventListener('click', toggleExpanded);
			this._listeners.push({element: this.controls.moreButton, toggleExpanded, type: 'click'});
		}

		if (!this._opts.expanded) {
			this.contractTable();
		}
	}

	/**
	 * Update all controls and their overlays,
	 * e.g. forward/back arrow visibility, visibility of arrow dock, overlay fade.
	 * @returns {undefined}
	 */
	_updateControls() {
		window.requestAnimationFrame(function () {
			this._updateFadeOverlay(this.controls.fadeOverlay);
			if (OverflowTable._supportsArrows()) {
				this._toggleArrowDock(this.controls.controlsOverlay);
				this._updateScrollControl(this.controls.forwardButton, 'forward');
				this._updateScrollControl(this.controls.backButton, 'back');
			}
		}.bind(this));
	}

	/**
	 * Show arrow dock if the table can be expanded, has a "more/less" button, and the table can be scrolled past.
	 * @param {HTMLElement} controlsOverlay - The table overlay which contains controls.
	 * @returns {undefined}
	 */
	_toggleArrowDock(controlsOverlay) {
		controlsOverlay.classList.toggle('o-table-control-overlay--arrow-dock', this._showArrowDock);
	}

	/**
	 * Updates CSS variables to change the fade overlay according to scroll position.
	 * @param {HTMLElement} fadeOverlay - The table overlay.
	 * @returns {undefined}
	 */
	_updateFadeOverlay(fadeOverlay) {
		fadeOverlay.style.setProperty('--o-table-fade-from-end', `${Math.min(this._fromEnd, 10)}px`);
		fadeOverlay.style.setProperty('--o-table-fade-from-start', `${Math.min(this._fromStart, 10)}px`);
	}

	/**
	 * Update the visibility of a scroll forward/back button.
	 * @param {HTMLElement} element - The button wrapper.
	 * @param {String} direction - Either 'forward' or 'back'.
	 * @returns {undefined}
	 */
	_updateScrollControl(element, direction) {
		if (['forward', 'back'].indexOf(direction) === -1) {
			throw new Error(`"${direction}" is not a recognised direction for a table scroll control.`);
		}
		// Make arrows sticky if table is tall and can be scrolled past.
		element.classList.toggle('o-table-control--sticky', this._showStickyArrows);
		// Place the arrows in the doc if they are not sticky.
		element.classList.toggle('o-table-control--dock', this._showArrowDock && !this._showStickyArrows);
		// Hide scroll buttons if the table fits within the viewport.
		if (this._canScrollTable) {
			element.style.display = '';
		} else {
			element.style.display = 'none';
		}
		// Disable forward button if the table is scrolled to the end.
		if ((this._fromEnd === 0 && direction === 'forward') || (this._fromStart === 0 && direction === 'back')) {
			element.querySelector('button').setAttribute('disabled', true);
			// Cannot scroll past table and no dock for sticky arrow, so arrow will obstruct table -- so hide disabled arrow.
			element.classList.toggle('o-table-control--hide', !this._showArrowDock && !this._canScrollPastTable);
		} else {
			element.querySelector('button').removeAttribute('disabled');
			element.classList.remove('o-table-control--hide');
		}
	}

	/**
	 * The number of rows to display if the table is collapsed.
	 * @returns {Number}
	 */
	get _minimumRowCount() {
		const minimumRowCount = this.rootEl.getAttribute('data-o-table-minimum-row-count');
		return isNaN(parseInt(minimumRowCount, 10)) ? 20 : parseInt(minimumRowCount, 10);
	}

	/**
	 * The number rows which will be hidden if the table is collapsed.
	 * @returns {Number}
	 */
	get _rowsToHide() {
		const visibleRowCount = Math.min(this.tableRows.length, this._minimumRowCount);
		return this.tableRows.slice(visibleRowCount, this.tableRows.length);
	}

	/**
	 * The rows which are currently hidden.
	 * @returns {Array[HTMLElement]}
	 */
	get _hiddenRows() {
		const visibleRowCount = Math.min(this.tableRows.length, this._minimumRowCount);
		return this.isExpanded() ? [] : this.tableRows.slice(visibleRowCount, this.tableRows.length);
	}

	/**
	 * The number of pixels left to scroll to reach the end of the table.
	 * @returns {Number}
	 */
	get _fromEnd() {
		return this.wrapper.scrollWidth - this.wrapper.clientWidth - this.wrapper.scrollLeft;
	}

	/**
	 * The number of pixels scrolled away from the start of the table.
	 * @returns {Number}
	 */
	get _fromStart() {
		return this.wrapper.scrollLeft;
	}

	/**
	 * Check if the table can be scrolled.
	 * @returns {Boolean}
	 */
	get _canScrollTable() {
		return this._fromEnd !== 0 || this._fromStart !== 0;
	}

	/**
	 * Check if the table can fit within the viewport vertically.
	 * @returns {Boolean}
	 */
	get _tableTallerThanViewport() {
		return this.container.getBoundingClientRect().height > document.documentElement.clientHeight;
	}

	/**
	 * Check if the document is long enough to scroll beyond the table enough for sticky arrows to dock at the bottom.
	 * I.e. Scroll past the table by at least 50% of the viewport.
	 * @returns {Boolean}
	 */
	get _canScrollPastTable() {
		return this.container.getBoundingClientRect().bottom + (document.documentElement.clientHeight / 2) < document.documentElement.getBoundingClientRect().bottom;
	}

	/**
	 * Check if the "dock" at the bottom of the table should be shown.
	 * After scrolling past the table, sticky arrows sit within the dock at the bottom of the table.
	 * @returns {Boolean}
	 */
	get _showArrowDock() {
		return OverflowTable._supportsArrows() && this._canScrollTable && this._tableCanExpand() && this._rowsToHide.length !== 0;
	}

	/**
	 * Check if left/right controls should be sticky.
	 * @returns {Boolean}
	 */
	get _showStickyArrows() {
		return OverflowTable._supportsArrows() && this._canScrollPastTable && this._tableTallerThanViewport;
	}

	/**
	 * Check if sticky buttons are supported.
	 * @returns {Boolean}
	 */
	static _supportsArrows() {
		return typeof CSS !== 'undefined' && CSS.supports("position", "sticky");
	}
}

export default OverflowTable;
