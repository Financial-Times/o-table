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
	return text.replace(/([^\d.,-\-]+)/g, '');
}

// This object is used to keep the running order of filter methods
const filters = {
	dom: [removeLinks],
	numeric: [removeDigitGroupSeparators, expandAbbreviations, extractNumber],
	text: []
};

export default function formatCell({ cell, isNumericValue = false }){
	let cellClone = cell.cloneNode({ deep: true });
	let sortValue = cell.getAttribute('data-o-table-sort-value');
	if(sortValue !== null){
		return isNumericValue ? parseFloat(sortValue) : sortValue;
	}

	// Extract value from dom node and format for sort.
	filters.dom.forEach(fn => { cellClone = fn(cellClone); });
	sortValue = extractText(cellClone);
	// Format numeric value.
	if (isNumericValue) {
		filters.numeric.forEach(fn => { sortValue = fn(sortValue); });
	}

	cell.setAttribute('data-o-table-sort-value', sortValue);

	return isNumericValue ? parseFloat(sortValue) : sortValue;
}
