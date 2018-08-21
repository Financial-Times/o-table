import dayjs from 'dayjs/src'

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
 *  extractNumber('HK$12-HK$20') //12-20
 *  extractNumber('Rp3,400') //3,400
 * @param {String} text The string to operate on
 * @returns {String} Text with number characters only.
 */
function extractNumber(text) {
	return text.replace(/-/g, '–').replace(/([^\d.,\–]+)/g, '');
}

function dateToUnixEpoch(text) {
	const date = dayjs(text);
	return date.unix().toString();
}

/**
 * Adds the current year to a date for sorting purposes if one has not been provided.
 * @example Example assume the current year is 2018/
 *  addYear('Feb 6') //Feb 6 2018
 *  addYear('May 4') //May 4 2018
 * @param {String} text The string to operate on
 * @returns {String} Text without source/reference asterisk.
 */
function addYear(text) {
	if (!text.match(/\d{4}/)) {
		text = `${text} ${new Date().getFullYear()}`;
	}
	return text;
}

function ftDateToUnixEpoch(text) {
	// FT style for writing dates is June 23 2016 (no commas, month date year), August 17, September 12 2012, January 2012.
	return text.replace(/^([A-Za-z]{3,})(?:[\s])(?=[\d])((?:\d{1,2})?(?![\d]))?(?:\s)?(\d{4})?/, (match, month, day, year, offset, text) => {
		const months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];
		day = day ? parseInt(day.replace(/[^\d]/, '')) : null;
		year = year ? parseInt(year.replace(/[^\d]/, '')) : null;
		const monthIndex = month ? months.findIndex((name) => name.includes(month)) : null;

		const date = new Date(year, monthIndex, day)
		return isNaN(date.getTime()) ? text : date.getTime().toString();
	});

	// if (!text.match(/\d{4}/)) {
	// 	text = `${text} ${new Date().getFullYear()}`;
	// }
	return text;
}

/**
 * Removes and number of asterisk's which are at the end of the line.
 * @example
 *  extractNumber('Durian*') //Durian
 *  extractNumber('1,439,165.43**') //1,439,165.43
 * @param {String} text The string to operate on
 * @returns {String} Text without source/reference asterisk.
 */
function removeRefereneAsterisk(text) {
	return text.replace(/\*+$/, '');
}

// This object is used to keep the running order of filter methods
const filters = {
	dom: [removeLinks],
	numeric: [removeDigitGroupSeparators, expandAbbreviations, extractNumber],
	date: [addYear, ftDateToUnixEpoch],
	text: [text => text.trim(), removeRefereneAsterisk]
};

export default function formatCell({ cell, isNumericValue = false, type = null }){
	let cellClone = cell.cloneNode({ deep: true });
	let sortValue = cell.getAttribute('data-o-table-sort-value');
	if(sortValue !== null){
		return isNumericValue ? parseFloat(sortValue) : sortValue;
	}

	// Extract value from dom node and format for sort.
	filters.dom.forEach(fn => { cellClone = fn(cellClone); });
	sortValue = extractText(cellClone);
	// Format text.
	filters.text.forEach(fn => { sortValue = fn(sortValue); });
	// Format numeric value.
	if (isNumericValue) {
		filters.numeric.forEach(fn => { sortValue = fn(sortValue); });
	}
	if (type === 'date') {
		filters.date.forEach(fn => { sortValue = fn(sortValue); });
	}

	cell.setAttribute('data-o-table-sort-value', sortValue);

	return isNumericValue ? parseFloat(sortValue) : sortValue;
}
