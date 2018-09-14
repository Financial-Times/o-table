import BaseTable from './BaseTable';

class OverflowTable extends BaseTable {
	constructor(rootEl, sorter) {
		super(rootEl, sorter);
		this._addSortButtons();
		if (this._overflowScrollEnabled()) {
			this._setupScroll();
		}
		if (this._expanderIsEnabled()) {
			this._setupExpander();
		}
		this._ready();
		return this;
	}

	get expanded() {
		const configuredValue = this.rootEl.getAttribute('data-o-table-expanded');
		return Boolean(configuredValue !== 'false');
	}

	set expanded(value) {
		this.rootEl.setAttribute('aria-expanded', value);
		this.rootEl.setAttribute('data-o-table-expanded', Boolean(value));
	}

	get _minimumRowCount() {
		const minimumRowCount = this.rootEl.getAttribute('data-o-table-minimum-row-count');
		return isNaN(parseInt(minimumRowCount, 10)) ? 20 : parseInt(minimumRowCount, 10);
	}

	get _hiddenRows() {
		const visibleRowCount = Math.min(this.tableRows.length, this._minimumRowCount);
		return this.expanded ? [] : this.tableRows.slice(visibleRowCount, this.tableRows.length);
	}

	get _rowsToHide() {
		const visibleRowCount = Math.min(this.tableRows.length, this._minimumRowCount);
		return this.tableRows.slice(visibleRowCount, this.tableRows.length);
	}

	contractTable() {
		this.expanded = false;
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
			this.wrapper.style.height = `${contractedHeight}px`;
			this.container.classList.remove('o-table-container--expanded');
			this.container.classList.add('o-table-container--contracted');
			if (moreButton) {
				moreButton.textContent = 'Show more';
				// Keep more/fewer button in viewport when contracting table.
				window.scrollBy({
					top: this.controls.moreButton.getBoundingClientRect().top - originalButtonTopOffset,
				});
			}
			this._updateControls();
		});
	}

	expandTable() {
		this.expanded = true;
		const moreButton = this.controls ? this.controls.moreButton.querySelector('button') : null;
		window.requestAnimationFrame(() => {
			this.container.classList.remove('o-table-container--contracted');
			this.container.classList.add('o-table-container--expanded');
			if (moreButton) {
				moreButton.textContent = 'Show fewer';
			}
			this.wrapper.style.height = '';
			this.tableRows.forEach(row => row.setAttribute('aria-hidden', false));
			this._updateControls();
		});
	}

	/**
	 * Sorts the table by a specific column
	 * @param {number} columnIndex The index of the column to sort the table by
	 * @param {bool} sortAscending Which direction to sort in, ascending or descending
	 * @returns undefined
	 */
	sorted({columnIndex, sortOrder}) {
		window.requestAnimationFrame(() => {
			this._updateRowVisibility();
			super.sorted({ columnIndex, sortOrder });
		});
	}

	_expanderIsEnabled() {
		return this.rootEl.hasAttribute('data-o-table-expanded') && (this._minimumRowCount < this.tableRows.length);
	}

	_overflowScrollEnabled() {
		// Is there is no wrapper assume the user intentionally omitted it,
		// as they do not want a scrolling table.
		return Boolean(this.wrapper);
	}

	_updateRowVisibility() {
		const hiddenRows = this._hiddenRows;
		this.tableRows.forEach((row) => {
			row.setAttribute('aria-hidden', hiddenRows && hiddenRows.includes(row) ? 'true' : 'false');
		});
	}

	_addControls() {
		if (this.container && !this.controls) {
			this.container.insertAdjacentHTML('beforeend', `
				${this._overflowScrollEnabled() ? `
					<div class="o-table-fade-overlay"></div>
				` : ''}
				<div class="o-table-control-overlay">
					${this._overflowScrollEnabled() ? `
						<div class="o-table-control o-table-control--back">
							<button class="o-buttons o-buttons--primary o-buttons--big o-buttons-icon o-buttons-icon--icon-only o-buttons-icon--arrow-left"></button>
						</div>
					` : ''}

					${this._overflowScrollEnabled() ? `
						<div class="o-table-control o-table-control--forward">
							<button class="o-buttons o-buttons--primary o-buttons--big o-buttons-icon o-buttons-icon--icon-only o-buttons-icon--arrow-right"></button>
						</div>
					` : ''}

					${this._expanderIsEnabled() ? `
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
		}
	}

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
			this._addControls();
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

		// Add backward button behaviour.
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


		if (this.controls.overlay && window.IntersectionObserver) {
			// Fade forward/backward buttons at start and end of table.
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

			// On scroll enable/Disable forward/backward buttons at edge of table.
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
			this.wrapper.addEventListener('scroll', updateControlsRateLimited.bind(this));
			this._listeners.push({
				element: this.wrapper,
				updateControlsRateLimited,
				type: 'scroll'
			});

			// On resize enable/Disable forward/backward buttons at edge of table.
			window.addEventListener('resize', updateControlsRateLimited.bind(this));
			this._listeners.push({
				element: window,
				updateControlsRateLimited,
				type: 'resize'
			});
		}
		// Update controls according to scroll position, etc.
		this._updateControls();
	}

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
			this._addControls();
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

		if (!this.expanded) {
			this.contractTable();
		}
	}

	_updateControls() {
		window.requestAnimationFrame(function() {
			const fromEnd = this.wrapper.scrollWidth - this.wrapper.clientWidth - this.wrapper.scrollLeft;
			const fromStart = this.wrapper.scrollLeft;
			const canScrollTable = (fromEnd !== 0 || fromStart !== 0);
			const containerRect = this.container.getBoundingClientRect();
			const tableTallerThanViewport = containerRect.height > document.documentElement.clientHeight;
			const canScrollPastTable = containerRect.bottom + (document.documentElement.clientHeight / 2) < document.documentElement.getBoundingClientRect().bottom;

			// Update scroll fade.
			this.container.style.setProperty('--o-table-fade-from-end', `${Math.min(fromEnd, 10)}px`);
			this.container.style.setProperty('--o-table-fade-from-start', `${Math.min(fromStart, 10)}px`);

			// Show arrow doc if the table can be expanded, has a "more/less" button, and the table can be scrolled past.
			const showArrowDock = canScrollTable && this._expanderIsEnabled() && this._rowsToHide.length !== 0 && canScrollPastTable;
			this.container.classList.toggle('o-table-container--arrow-dock', showArrowDock);

			// Make arrows sticky if table is tall and can be scrolled past.
			const stickyArrows = tableTallerThanViewport;
			this.controls.forwardButton.classList.toggle('o-table-control--sticky', tableTallerThanViewport);
			this.controls.backButton.classList.toggle('o-table-control--sticky', tableTallerThanViewport);

			// Place the arrows in the doc if they are not sticky.
			this.controls.forwardButton.classList.toggle('o-table-control--dock', showArrowDock && !stickyArrows);
			this.controls.backButton.classList.toggle('o-table-control--dock', showArrowDock && !stickyArrows);

			// Hide scroll buttons if the table fits within the viewport.
			if (canScrollTable) {
				this.controls.forwardButton.style.display = '';
				this.controls.backButton.style.display = '';
			} else {
				this.controls.forwardButton.style.display = 'none';
				this.controls.backButton.style.display = 'none';
			}

			// Disable forward button if the table is scrolled to the end.
			if (fromEnd === 0) {
				this.controls.forwardButton.querySelector('button').setAttribute('disabled', true);
				// Cannot scroll past table and no dock for sticky arrow, so arrow will obstruct table -- so hide disabled arrow.
				this.controls.forwardButton.classList.toggle('o-table-control--hide', !showArrowDock && !canScrollPastTable);
			} else {
				this.controls.forwardButton.querySelector('button').removeAttribute('disabled');
				this.controls.forwardButton.classList.remove('o-table-control--hide');
			}

			// Disable back button if the table has not scrolled.
			if (fromStart === 0) {
				this.controls.backButton.querySelector('button').setAttribute('disabled', true);
				// Cannot scroll past table and no dock for sticky arrow, so arrow will obstruct table -- so hide disabled arrow.
				this.controls.backButton.classList.toggle('o-table-control--hide', !showArrowDock && !canScrollPastTable);
			} else {
				this.controls.backButton.querySelector('button').removeAttribute('disabled');
				this.controls.backButton.classList.remove('o-table-control--hide');
			}
		}.bind(this));
	}
}

export default OverflowTable;
