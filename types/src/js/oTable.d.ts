export default OTable;
declare class OTable {
    /**
     * Constructs all o-table components inside the element passed as the first parameter.
     *
     * @access public
     * @param {(HTMLElement|string)} [el=document.body] - Element where to search for o-table components. You can pass an HTMLElement or a selector string.
     * @param {...OTable~opts} opts - A table options object.
     * @returns {Array<FlatTable | ScrollTable | OverflowTable | BasicTable> | FlatTable | ScrollTable | OverflowTable | BasicTable} - A table instance or array of table instances.
     */
    static init(el?: (HTMLElement | string), opts?: {}): Array<FlatTable | ScrollTable | OverflowTable | BasicTable> | FlatTable | ScrollTable | OverflowTable | BasicTable;
    /**
     * The custom formatter accepts a table cell and returns a sort value for that cell.
     * This could be used to define a custom sort order for an unsupported format, such as emoji's, or a new date format.
     *
     * @callback formatFunction
     * @param {HTMLElement} cell
     */
    /**
     * Set a custom sort formatter for a given data type.
     *
     * @example <caption>Mapping table cells which contain emojis to a numerical sort value.</caption>
     *	import OTable from '@financial-times/o-table';
     *	// Set a filter for custom data type "emoji-time".
     *	// The return value may be a string or number.
     *	OTable.setSortFormatterForType('emoji-time', (cell) => {
     *		const text = cell.textContent.trim();
     *		if (text === '🌑') {
     *			return 1;
     *		}
     *		if (text === '🌤️️') {
     *			return 2;
     *		}
     *		return 0;
     *	});
     *	OTable.init();
     *
     * @param {String} type - The data type to apply the filter function to.
     * @param {formatFunction} formatFunction
     * @access public
     */
    static setSortFormatterForType(type: string, formatFunction: (cell: HTMLElement) => any): void;
    /**
     * Table options.
     * @typedef {Object} OTable~opts - Table options.
     * @property {Bool} sortable [true] - Disable the table's sort feature.
     * @property {Undefined | Bool} expanded [Undefined] - Allow the "OverflowTable" to hide results behind a "show more" button. The table is expanded by default when "true", contracted when "false", or not expandable if not set.
     * @property {Number} minimumRowCount [20] - When the `expanded` option is set, the number of rows to show when the table is not expanded.
     */
    /**
     * Constructs an o-table component.
     *
     * @param {HTMLElement} - An o-table element.
     * @param {...OTable~opts} opts - A table options object.
     * @returns {FlatTable | ScrollTable | OverflowTable | BasicTable} - A table instance.
     */
    constructor(rootEl: any, opts?: {});
}
import FlatTable from "./Tables/FlatTable.js";
import ScrollTable from "./Tables/ScrollTable.js";
import OverflowTable from "./Tables/OverflowTable.js";
import BasicTable from "./Tables/BasicTable.js";
