export default BaseTable;
declare class BaseTable {
    /**
     * Check if a given table cell matches the table filter.
     *
     * @access private
     * @param {Element} cell - The table cell to test the filter function against.
     * @param {String|Function} filter - The filter, either a string or callback function.
     * @returns {Boolean}
     */
    static _filterMatch(cell: Element, filter: string | Function): boolean;
    /**
     * The shared functionality of all `o-table` variants.
     *
     * @access public
     * @param {HTMLElement} rootEl - The `o-table` element.
     * @param {TableSorter} sorter
     * @param {Object} opts [{}]
     * @param {Bool} opts.sortable [true]
     * @returns {BaseTable}
     */
    constructor(rootEl: HTMLElement, sorter: any, opts?: {
        sortable: any;
    });
    _listeners: any[];
    _sorter: any;
    rootEl: HTMLElement;
    _opts: any;
    thead: HTMLTableSectionElement;
    tbody: HTMLTableSectionElement;
    tableCaption: HTMLTableCaptionElement;
    tableHeaders: any;
    tableRows: any;
    _filteredTableRows: any[];
    wrapper: Element;
    container: Element;
    overlayWrapper: Element;
    filterContainer: Element;
    _updateTableHeightListenerSet: boolean;
    /**
     * @property {Object|Null} _currentSort - The current sort applied.
     * @property {Number} _currentSort.columnIndex - The index of the currently sorted column.
     * @property {String} _currentSort.sortOrder - The type of sort, "ascending" or "descending"
     */
    _currentSort: {
        sortOrder: string;
        columnIndex: number;
    };
    /**
     * @property {Object|Null} _currentFilter - The filter currently applied.
     * @property {Number} _currentFilter.columnIndex - The index of the column which is filtered.
     * @property {String|Function} _currentFilter.filter - The filter applied.
     */
    _currentFilter: {
        columnIndex: number;
        filter: TimerHandler;
    };
    /**
     * Apply and add event listeners to any filter controls for this table.
     * E.g. form inputs with the data attribute `[data-o-table-filter-id="tableId"]`
     * @access private
     */
    _setupFilters(): void;
    /**
     * Update the o-table instance with rows added or removed dynamically from
     * the table. Applies any existing sort and filter to new rows.
     *
     * @returns {undefined}
     */
    updateRows(): undefined;
    /**
     * Get all the table body's current row nodes.
     *
     * @returns {Array<Node>}
     * @access private
     */
    _getLatestRowNodes(): Array<Node>;
    /**
     * Updates the dom to account for row updates, including when their sort
     * order changes, or any filter is applied. E.g. changes the dom order,
     * applies aria-labels to hidden rows, updates the table height to
     * efficiently hide them.
     *
     * Note this does not calculate which rows should be sorted or filtered,
     * and does not look for new rows added to the dom. See `updateRows`.
     *
     * @see updateRows
     * @returns {undefined}
     */
    renderRowUpdates(): undefined;
    /**
     * Hide filtered rows by updating the container height.
     * Filtered rows are not removed from the table so column width is not
     * recalculated. Unfortunately "visibility: collaposed" has inconsistent
     * support.
     */
    _updateTableHeight(): void;
    _updateTableHeightScheduled: number;
    /**
     * Get the table height, accounting for "hidden" rows.
     * @return {Number|Null}
     */
    _getTableHeight(): number | null;
    /**
    * Update the "aria-hidden" attribute of all hidden table rows.
    * Rows may be hidden for a number of reasons, including being filtered.
    */
    _updateRowAriaHidden(): void;
    _updateRowAriaHiddenScheduled: number;
    /**
     * Hide filtered rows by updating the "data-o-table-filtered" attribute.
     * Filtered rows are removed from the table using CSS so column width is
     * not recalculated.
     */
    _hideFilteredRows(): void;
    _hideFilteredRowsScheduled: number;
    /**
    * Updates the order of table rows in the DOM. This is required upon sort,
    * but also on filter as hidden rows must be at the bottom of the table.
    * Otherwise the stripped pattern of the stripped table is not maintained.
    */
    _updateRowOrder(): void;
    _updateRowOrderScheduled: number;
    /**
     * Filter the table and render the result.
     *
     * @access public
     * @param {Number} headerIndex - The index of the table column to filter.
     * @param {String|Function} filter - How to filter the column (either a string to match or a callback function).
     * @returns {undefined}
     */
    filter(headerIndex: number, filter: string | Function): undefined;
    /**
     * Filters the table rows by a given column and filter.
     * This does not render the result to the DOM.
     *
     * @access private
     * @param {Number} columnIndex - The index of the table column to filter.
     * @param {String|Function} filter - How to filter the column (either a string to match or a callback function).
     * @returns {undefined}
     */
    _filterRowsByColumn(columnIndex: number, filter: string | Function): undefined;
    /**
     * Which rows are hidden, e.g. by a filter.
     * @returns {Array[Node]}
     */
    get _rowsToHide(): any;
    /**
     * Gets a table header for a given column index.
     *
     * @access public
     * @param {Number} columnIndex - The index of the table column to get the header for.
     * @throws When no header is not found.
     * @returns {HTMLElement}
     */
    getTableHeader(columnIndex: number): HTMLElement;
    /**
     * Sort the table.
     *
     * @access public
     * @param {Number} columnIndex - The index of the table column to sort.
     * @param {Number} sortOrder - How to sort the column, "ascending" or "descending"
     * @returns {undefined}
     */
    sortRowsByColumn(columnIndex: number, sortOrder: number): undefined;
    /**
     * Add sort buttons to the DOM within the table header.
     * @returns {undefined}
     */
    addSortButtons(): undefined;
    _rootElDomDelegate: any;
    /**
     * Indicate that the table has been sorted after intercepting the sorting event.
     *
     * @access public
     * @param {Object} sortDetails - Details of the current sort state.
     * @param {Number|Null} sortDetails.columnIndex - The index of the currently sorted column.
     * @param {String|Null} sortDetails.sortOrder - The type of sort, "ascending" or "descending"
     */
    sorted({ columnIndex, sortOrder }: {
        columnIndex: number | null;
        sortOrder: string | null;
    }): void;
    /**
     * Gets the instance ready for deletion.
     * Removes event listeners that were added during instatiation of the component.
     * @access public
     * @returns {undefined}
     */
    destroy(): undefined;
    /**
     * Indicate that the table has been constructed successfully.
     * @returns {undefined}
     */
    _ready(): undefined;
    /**
     * Column sort orders are toggled. For a given column heading, return
     * the next sort order which should be applied.
     * @param {Element} th - The heading for the column to be sorted.
     * @returns {String} - What the next sort order for the heading should be, 'ascending' or 'descending'.
     */
    _getNextSortOrder(th: Element): string;
    /**
     * Handles a sort button click event. Toggles column sort.
     * @param {MouseEvent} event - The click event.
     * @returns {undefined}
     */
    _sortButtonHandler(event: MouseEvent): undefined;
    /**
     * Helper function to dispatch namespaced events.
     *
     * @param {String} event - The event name within `oTable` e.g. "sorted".
     * @param {Object} data={} - Event data. `instance` is added automatically.
     * @param {Object} opts={} - [Event options]{@link https://developer.mozilla.org/en-US/docs/Web/API/Event/Event#Values} (o-table events bubble by default).
     */
    _dispatchEvent(event: string, data?: any, opts?: any): boolean;
}
