export default OverflowTable;
declare class OverflowTable extends BaseTable {
    /**
     * Check if sticky buttons are supported.
     * @returns {Boolean}
     */
    static _supportsArrows(): boolean;
    /**
     * Initialises an `o-table` component with "overflow" responsive behaviour.
     *
     * @param {HTMLElement} rootEl - The `o-table` element.
     * @param {TableSorter} sorter
     * @param {Object} opts [{}]
     * @param {Bool} opts.sortable [true]
     * @param {Undefined | Bool} opts.expanded
     * @param {Number} opts.minimumRowCount [20]
     * @access public
     * @returns {OverflowTable}
     */
    constructor(rootEl: HTMLElement, sorter: any, opts?: {
        sortable: any;
        expanded: undefined | any;
        minimumRowCount: number;
    });
    /**
     * Check if the table is expanded (true) or collapsed (false).
     * @access public
     * @returns {Bool}
     */
    isExpanded(): any;
    /**
     * Check if the table is collapsed (true) or expanded (false).
     * @access public
     * @returns {Bool}
     */
    isContracted(): any;
    /**
     * Check if the table supports the expand/contract feature.
     * @access public
     * @returns {Bool}
     */
    canExpand(): any;
    _updateExpander(): void;
    _expanderUpdateScheduled: number;
    /**
     * Hides table rows if the table can be expanded.
     * @access public
     * @returns undefined
     */
    contractTable(): void;
    _expand: boolean;
    /**
     * Expands the table, revealing hidden table rows, if it can be expanded and has been contracted.
     * @access public
     * @returns undefined
     */
    expandTable(): void;
    _contractedWrapperHeight: number;
    /**
     * Add controls such as the back, forward, "show more" buttons to DOM,
     * plus wrappers needed for them to function.
     * @returns {undefined}
     */
    _addControlsToDom(): undefined;
    controls: {
        controlsOverlay: Element;
        fadeOverlay: Element;
        expanderButton: Element;
        forwardButton: Element;
        backButton: Element;
    };
    _updateControlOverlayPosition(): void;
    /**
     * Add functionality to improve the experience when scrolling a table,
     * such as showing forward/back buttons to indicate that scroll is possible.
     * @returns {undefined}
     */
    _setupScroll(): undefined;
    /**
     * Add hide/show functionality for long tables.
     * @returns {undefined}
     */
    _setupExpander(): undefined;
    /**
     * Update all controls and their overlays,
     * e.g. forward/back arrow visibility, visibility of arrow dock, overlay fade.
     * @returns {undefined}
     */
    _updateControls(): undefined;
    /**
     * Update the visibility of a scroll forward/back button.
     * @param {HTMLElement} element - The button wrapper.
     * @returns {undefined}
     */
    _updateScrollControl(element: HTMLElement): undefined;
    /**
     * The number of rows to display if the table is collapsed.
     * @returns {Number}
     */
    get _minimumRowCount(): number;
    /**
     * The rows which will be hidden if the table is collapsed.
     * @returns {Array[Node]}
     */
    get _rowsHiddenByExpander(): any;
    /**
     * Check if the table can be scrolled.
     * @returns {Boolean}
     */
    get _canScrollTable(): boolean;
    /**
     * Check if the table can fit within the viewport vertically.
     * @returns {Boolean}
     */
    get _tableTallerThanViewport(): boolean;
    /**
     * Check if the document is long enough to scroll beyond the table enough for sticky arrows to dock at the bottom.
     * I.e. Scroll past the table by at least 50% of the viewport.
     * @returns {Boolean}
     */
    get _canScrollPastTable(): boolean;
    /**
     * Check if the "dock" at the bottom of the table should be shown.
     * After scrolling past the table, sticky arrows sit within the dock at the bottom of the table.
     * @returns {Boolean}
     */
    get _showArrowDock(): boolean;
    /**
     * Check if left/right controls should be sticky.
     * @returns {Boolean}
     */
    get _stickyArrows(): boolean;
}
import BaseTable from "./BaseTable.js";
