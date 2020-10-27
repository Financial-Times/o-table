export default FlatTable;
declare class FlatTable extends BaseTable {
    /**
     * Initialises an `o-table` component with "flat" responsive behaviour.
     *
     * @access public
     * @param {HTMLElement} rootEl - The `o-table` element.
     * @param {TableSorter} sorter
     * @param {Object} opts [{}]
     * @param {Bool} opts.sortable [true]
     * @returns {FlatTable}
     */
    constructor(rootEl: HTMLElement, sorter: any, opts?: {
        sortable: any;
    });
    _tableHeadersWithoutSort: any;
    /**
     * Duplicate table headers for each data item.
     * I.e. Each row is shown as a single item with its own headings.
     *
     * @access private
     */
    _createFlatTableStructure(rows?: any): void;
}
import BaseTable from "./BaseTable.js";
