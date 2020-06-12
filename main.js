import oTable from "./src/js/oTable"

const constructAll = function() {
	oTableinit();
	document.removeEventListener('o.DOMContentLoaded', constructAll)
}

document.addEventListener('o.DOMContentLoaded', constructAll);

export default oTable;
