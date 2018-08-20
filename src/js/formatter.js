/**
 * Extracts the contents of links (<a>) keeping the HTML content intact.
 * @param {HTMLElement} cell The DOM node to operate on, possibly a <td>
 * @returns {HTMLElement} the parameter
 */
function removeLinks( cell ){
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
function extractText( cell ){ 
  return cell.textContent;
}


function expandAbbreviations( text ){

  return text;
}

// This object is used to keep the running order of filter methods
const filters = {
  dom: [removeLinks],
  numeric: [expandAbbreviations],
  text: []
};

export default function formatCell({ cell, isNumericValue = false }){
  let sortValue = cell.getAttribute('data-sort-value');
  if( sortValue !== null ){
    return sortValue;
  }

  filters.dom.forEach( fn => { cell = fn(cell) });
  let textContent = extractText(cell);
  filters.numeric.forEach( fn => { text = fn(text) });
  
  return textContent;
}