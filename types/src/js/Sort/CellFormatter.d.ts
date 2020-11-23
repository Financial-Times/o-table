export default CellFormatter;
/**
 * Methods to format table cells for sorting.
 * @access public
 */
declare class CellFormatter {
    filters: {
        text: (typeof extractNodeContent)[];
        number: (typeof extractNodeContent | typeof extractNumber)[];
        percent: (typeof extractNodeContent | typeof extractNumber)[];
        currency: (typeof extractNodeContent | typeof extractNumber)[];
        numeric: (typeof extractNodeContent | typeof extractNumber)[];
        date: (typeof extractNodeContent | typeof ftDateTimeToNumber)[];
    };
    /**
     * The `formatFunction` take the table cell HTMLElement,
     * and converts it to a String or Number of sorting.
     *
     * @callback formatFunction
     * @param {HTMLElement} cell
     * @return {String|Object}
     */
    /**
     * @param {String} type The data type of the cell to apply the filter function to.
     * @param {formatFunction} formatFunction The function to take the cell and return a sortable value (string/number).
     * @example
     *  mySortFormatter.setFormatter('emoji-time', (cell) => {
     *  	const text = cell.textContent.trim();
     *  	if (text === '🌑') {
     *  		return 1;
     *  	}
     *  	if (text === '🌤️️') {
     *  		return 2;
     *  	}
     *  	return 0;
     *  });
     * @access public
     */
    setFormatter(type: string, formatFunction: (cell: HTMLElement) => string | any): void;
    /**
     * @param {HTMLElement} cell
     * @param {String} type The data type of the cell, e.g. date, number, currency. Custom types are supported.
     * @see {@link setFormatter} to support add support for a custom type.
     * @access public
     * @return {String|Number} A representation of cell which can be used for sorting.
     */
    formatCell({ cell, type }: HTMLElement): string | number;
}
/**
 * Group of filters to extract text from a cell.
 * @param {HTMLElement} cell The node to extract sortable text from.
 * @access private
 * @returns {String} The node content to sort on.
 */
declare function extractNodeContent(cell: HTMLElement): string;
/**
 * Group of filters to extract a number for sorting.
 * @param {String} text The string to operate on
 * @access private
 * @returns {Number|String} A number if one could a extracted, string otherwise.
 */
declare function extractNumber(text: string): number | string;
/**
 * Parses FT style date and time and formats as a number for sorting.
 * FT date or date and time returns a UNIX epoch (UTC).
 * FT time returns a positive float for pm, negative for am.
 * @example
 *  ftDateTimeToNumber('August 17') //UNIX epoch, assumes current year
 *  ftDateTimeToNumber('September 12 2012') //UNIX epoch
 *  ftDateTimeToNumber('January 2012') //UNIX epoch, first of month
 *  ftDateTimeToNumber('March 12 2015 1am') //UNIX epoch including time
 *  ftDateTimeToNumber('April 20 2014 1.30pm') //UNIX epoch including time
 *  ftDateTimeToNumber('1am') //1
 *  ftDateTimeToNumber('1.30am') //1.3
 *  ftDateTimeToNumber('1.40pm') //13.4
 *  ftDateTimeToNumber('3pm') //15
 *  ftDateTimeToNumber('Not a known date') //Note a known date
 * @param {String} text The string to operate on
 * @access private
 * @returns {Number} Number representation of date and/or time for sorting.
 */
declare function ftDateTimeToNumber(text: string): number;
