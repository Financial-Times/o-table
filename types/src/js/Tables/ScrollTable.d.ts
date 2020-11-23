export default ScrollTable;
declare class ScrollTable extends BaseTable {
    /**
     * Initialises an `o-table` component with "scroll" responsive behaviour.
     *
     * @access public
     * @param {HTMLElement} rootEl - The `o-table` element.
     * @param {TableSorter} sorter
     * @param {Object} opts [{}]
     * @param {Bool} opts.sortable [true]
     * @returns {ScrollTable}
     */
    constructor(rootEl: HTMLElement, sorter: any, opts?: {
        sortable: any;
    });
    _tableHeadersWithoutSort: any;
    /**
     * Duplicate table headers and rows to create a table which has row headings
     * rather than column headings. I.e. The table is consumed left to right,
     * rather than top to bottom.
     *
     * @access private
     * @returns {undefined}
     */
    _createScrollTableStructure(): undefined;
}
import BaseTable from "./BaseTable.js";
