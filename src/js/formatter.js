/**
 * Extracts the contents of links (<a>) keeping the HTML content intact.
 * @param {HTMLElement} cell The DOM node to operate on, possibly a <td>
 * @returns {HTMLElement} the parameter
 */
function removeLinks(cell){
	const links = Array.from(cell.getElementsByTagName('a'));
	links.forEach(link => {
		const contents = link.innerHTML;
		link.insertAdjacentHTML('beforebegin', contents);
		link.remove();
	});

	return cell;
}

/**
 * Returns the text represantation of an HTML node
 * @param {HTMLElement} cell The DOM node to operate on, possibly a <td>
 * @returns {HTMLElement} text representation of the HTML node
 */
function extractText(cell){
	return cell.textContent.trim();
}

/**
 * Returns the text with abbreviations expanded.
 * Supports million 'm', billion 'bn' (1,000 million), and trillion 'tn' (1,000 billion).
 * @example
 *  expandAbbreviations('1m') //1000000
 *  expandAbbreviations('1.2bn') //2200000000
 *  expandAbbreviations('1tn') //1000000000000
 *  expandAbbreviations('5m-10m') //5000000-10000000
 * @param {String} text The string to operate on
 * @returns {String} Text with any supported abbreviations expanded
 */
function expandAbbreviations(text) {
	text = text.replace(/([\d,.]+)([a-zA-Z]+)/g, (match, digit, abbreviation) => {
		const zeros = {
			'm': 6,
			'bn': 9,
			'tn': 12
		};
		return `${digit * Math.pow(10, zeros[abbreviation] || 0)}`;
	});
	return text;
}

/**
 * Returns the text with digit group separators removed.
 * @example
 *  removeDigitGroupSeparator('1,000') //1000
 *  removeDigitGroupSeparator('40') //40
 *  removeDigitGroupSeparator('4,000,000') //4000000
 * @param {String} text The string to operate on
 * @returns {String} Text with digit group separators (commas) removed.
 */
function removeDigitGroupSeparators(text) {
	return text.replace(/,/g, '');
}

/**
 * Returns the text with non-number charactors removed (e.g. currency symbols).
 * Does not effect range charactors e.g. "–" will be maintained.
 * @example
 *  extractNumber('Rmb100') //100
 *  extractNumber('CFA Fr830') //830
 *  extractNumber('HK$12') //12
 *  extractNumber('HK$12-HK$20') //12–20
 *  extractNumber('1534956593-1534956620') //1534956593–1534956620
 * @param {String} text The string to operate on
 * @returns {String} Text with number characters only.
 */
function extractNumber(text) {
	return text.replace(/-/g, '–').replace(/([^\d.,\–]+)/g, '');
}

/**
 * Parses FT style date and time and formats as a number for sorting.
 * FT date or date and time returns a UNIX epoch (UTC).
 * FT time returns a positive float for pm, negative for am.
 * @example
 *  extractNumber('August 17') //UNIX epoch, assumes current year
 *  extractNumber('September 12 2012') //UNIX epoch
 *  extractNumber('January 2012') //UNIX epoch, first of month
 *  extractNumber('March 12 2015 1am') //UNIX epoch including time
 *  extractNumber('April 20 2014 1.30pm') //UNIX epoch including time
 *  extractNumber('1am') //-1
 *  extractNumber('1.30am') //-1.3
 *  extractNumber('1.40pm') //1.4
 *  extractNumber('3pm') //3
 * @param {String} text The string to operate on
 * @returns {Number} Number representation of date and/or time for sorting.
 */
function ftDateTimeToUnixEpoch(text) {
	const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	// FT style for writing dates: is June 23 2016 (no commas, month date year)
	const date = text.match(/^([A-Za-z]{3,})(?:[\s])(?=[\d])((?:\d{1,2})?(?![\d]))?(?:\s)?(\d{4})?/);
	// FT style for writing time:
	// The 12 hour clock should be used: 1am, 9.30pm
	const time = text.match(/(?:\s|^)(\d{1,2}(?:[.](\d{2}))?)(pm|am)$/);
	// Get date.
	const month = date && date[1] ? date[1] : null;
	const monthIndex = month ? months.findIndex((name) => name.includes(month)) : null;
	const day = date && date[2] ? parseInt(date[2]) : null;
	let year = date && date[3] ? parseInt(date[3]) : null;
	if (month && !year) {
		// For sorting purposes, assume a month is for this year if not otherwise specified.
		year = (new Date(Date.UTC())).getFullYear();
	}
	// Get time.
	const hour = time && time[1] ? parseInt(time[1]) : null;
	const minute = time && time[2] ? parseInt(time[2]) : 0;
	const period = time ? time[3] : null;
	const timeModifier = period === 'am' ? -1 : 1;
	// Sort number for FT formated time.
	if (hour && !(year && monthIndex)) {
		return parseFloat(`${hour}.${minute}`) * timeModifier;
	}
	// Unix epoch to sort FT formated date.
	const dateObj = new Date(Date.UTC(year, monthIndex, day, hour, minute));
	return isNaN(dateObj.getTime()) ? text : dateObj.getTime();
}

/**
 * Removes and number of asterisk's which are at the end of the line.
 * @example
 *  removeRefereneAsterisk('Durian*') //Durian
 *  removeRefereneAsterisk('1,439,165.43**') //1,439,165.43
 * @param {String} text The string to operate on
 * @returns {String} Text without source/reference asterisk.
 */
function removeRefereneAsterisk(text) {
	return text.replace(/\*+$/, '');
}

// This object is used to keep the running order of filter methods
const filters = {
	numeric: [removeDigitGroupSeparators, expandAbbreviations, extractNumber],
	date: [ftDateTimeToUnixEpoch],
	all: [removeLinks, extractText, removeRefereneAsterisk]
};

export default function formatCell({ cell, type = null }) {
	const numericTypes = ['currency', 'percent', 'number'];
	const isNumericType = numericTypes.includes(type);
	let cellClone = cell.cloneNode({ deep: true });
	let sortValue = cell.getAttribute('data-o-table-sort-value');
	if(sortValue === null){
		sortValue = cellClone;
		// Extract value from dom node and format for sort.
		filters.all.forEach(fn => { sortValue = fn(sortValue); });
		// Format types which are treated as numeric for sorting.
		if (isNumericType) {
			filters.numeric.forEach(fn => { sortValue = fn(sortValue); });
		}
		// Format types.
		if (filters[type]) {
			filters[type].forEach(fn => { sortValue = fn(sortValue); });
		}
		cell.setAttribute('data-o-table-sort-value', sortValue);
	}
	return isNaN(sortValue) || !isNumericType ? sortValue : parseFloat(sortValue);
}
