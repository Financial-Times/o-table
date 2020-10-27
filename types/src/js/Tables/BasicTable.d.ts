export default BasicTable;
declare class BasicTable extends BaseTable {
    /**
     * Initialises an `o-table` component without responsive behaviour.
     *
     * @access public
     * @param {HTMLElement} rootEl - The `o-table` element.
     * @param {TableSorter} sorter
     * @param {Object} opts [{}]
     * @param {Bool} opts.sortable [true]
     * @returns {BasicTable}
     */
    constructor(rootEl: HTMLElement, sorter: any, opts?: {
        sortable: any;
    });
}
import BaseTable from "./BaseTable.js";
