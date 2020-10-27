export default TableSorter;
/**
 * Provides methods to sort table instances.
 */
declare class TableSorter {
    _cellFormatter: CellFormatter;
    /**
     * Sort the given table.
     *
     * @access public
     * @param {BaseTable} table - The table instance to sort.
     * @param {Number} columnIndex - The index of the table column to sort.
     * @param {String} sortOrder - How to sort the column, "ascending" or "descending"
     * @param {Number} batch [100] - Deprecated. No longer used. How many rows to render at once when sorting.
     * @returns {undefined}
     */
    sortRowsByColumn(table: any, columnIndex: number, sortOrder: string, batch: number): undefined;
    /**
     * Set a custom cell formatter for a given data type.
     *
     * @param {String} type - The data type to apply the filter function to.
     * @param {formatFunction} formatFunction - Callback to format a table cell to a sort value.
     * @see {@link CellFormatter~setFormatter} for `formatFunction` details.
     * @access public
     */
    setCellFormatterForType(type: string, formatFunction: any): void;
}
import CellFormatter from "./CellFormatter.js";
