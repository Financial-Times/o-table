# o-table [![Build Status](https://circleci.com/gh/Financial-Times/o-table.png?style=shield&circle-token=6c1d4241aefb825cb3870d5294e09dd370240c64)](https://circleci.com/gh/Financial-Times/o-table)

Styling for tables.

- [Usage](#usage)
	- [Markup](#markup)
	- [Sass](#sass)
	- [JavaScript](#javascript)
- [Troubleshooting](#troubleshooting)
- [Migration guide](#migration-guide)
- [Contact](#contact)
- [Licence](#licence)

## Usage

### Markup

Add an `o-table` class to any table you wish to apply the styles to:

```html
<table class="o-table" data-o-component="o-table">
	...
</table>
```

Where a `td` contains numeric data, or a `th` is for cells containing numeric data, also add the class `.o-table__cell--numeric` and a `data-o-table-data-type="numeric"` attribute (the latter allows the column to be sorted correctly):

```html
<table class="o-table" data-o-component="o-table">
	<tr>
		<th>Index</th>
		<th data-o-table-data-type="numeric" class="o-table__cell--numeric">Value</th>
	</tr>
	<tr>
		<td>FTSE 100</td>
		<td data-o-table-data-type="numeric" class="o-table__cell--numeric">6685.52</td>
	</tr>
	...
</table>
```

Where table headings (`th`) are used as row headings, `scope="row"` attributes must be set on the `th`:

```html
<table class="o-table" data-o-component="o-table">
	<tr>
		<th scope="row">FTSE 100</th>
		<td data-o-table-data-type="numeric" class="o-table__cell--numeric">6685.52</td>
	</tr>
	...
</table>
```

When they're are not present, browsers will implicitly wrap table contents in `tbody` tags, including the header row. It is therefore advisable (and when row-stripes are required, essential) to use `thead`, `tbody` (and if appropriate, `tfoot`) tags in your markup:

```html
<table class="o-table" data-o-component="o-table">
	<thead>
		<tr>
			<th>Index</th>
			<th data-o-table-data-type="numeric" class="o-table__cell--numeric">Value</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>FTSE 100</td>
			<td data-o-table-data-type="numeric" class="o-table__cell--numeric">6685.52</td>
		</tr>
		...
	</tbody>
</table>
```

#### Disable sort on one or more columns

Adding `data-o-table-heading-disable-sort` to a table column heading will disable and hide the sort interface on that column heading. This is useful for columns of a table which do not provide sortable data, such as an edit button related to the data in its row.

```html
<table class="o-table" data-o-component="o-table">
	<thead>
		<tr>
			<th>Heading One</th>
			<th>Heading Two</th>
			<!-- do not show the actions column as sortable -->
			<th data-o-table-heading-disable-sort>Actions</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Item One</td>
			<td>Item Two</td>
			<td>
				<a href="#edit">edit</a>
			</td>
		</tr>
	</tbody>
</table>
```

#### Small screen rendering

Where there is not enough horizontal space for a table to fit, it can be made horizontally scrollable by wrapping it in an element with a class of `o-table-wrapper`:

```html
<div class="o-table-wrapper">
	<table class="o-table" data-o-component="o-table">
		...
	</table>
</div>
```

This can also be done using the provided `wrap()` javascript function:

```javascript
var oTable = require('o-table');
oTable.wrap();
```

This function can be passed two arguments:

* target tables selector (default `.o-table`);
* wrapper CSS class (default `o-table-wrapper`);

For example, to wrap only tables within a certain part of the page, you can do this:

```javascript
var oTable = require('o-table');
oTable.wrap('.content-zone .o-table', 'o-table-custom-wrapper');
```

Note that tables matching the selector will not be wrapped, if they already have a parent node that has the wrapper class.

### Sass

#### Silent mode

If using __o-table__ in silent mode, use the mixin `oTableBase' in your table styles:

```sass
.my-table {
	@include oTableBase;
}
```

#### Variant classes and placeholders

Additional classes may be added to the table root element to also apply the following styling options. They can be combined as required.

#### Content styles

Class: `o-table__cell--content-secondary`, Mixin: `oTableCellContentSecondary`

Reduce the size of some text in a cell and display block to start a new line. The class should be applied to a `<span>` or `<div>` element inside of the table cell.

#### Cell alignment

Class: `o-table__cell--numeric`, Mixin: `oTableCellNumeric`

Right-align the cell contents.

Class: `o-table__cell--vertically-center`, Mixin: `oTableCellVerticallyCenter`

Vertically center the cell contents.

#### Row stripes

Class: `o-table--row-stripes`, Mixin: `oTableRowStripes`

A background colour will be set on the whole table, and alternate rows within the `tbody` will have their background colour set to a pink tint.

#### Horizontal lines

Class: `o-table--horizontal-lines`, Mixin: `oTableHorizontalLines`

Thin lines will be rendered under each `td` element giving the appearance of lines between rows.

#### Vertical lines

Class: `o-table--vertical-lines`, Mixin : `oTableVerticalLines`

Thin lines will be rendered to the left and right of each `td` element giving the appearance of lines between columns.

#### Responsive

There are three responsive options available for displaying data in a table.

##### Flat

Class: `o-table--responsive-flat`, Mixin: `oTableResponsiveFlat`

Using the Responsive Flat version will render the table to change at narrow viewpoints into a row-based table with each row having a duplicate of the table headers on the left side. This uses JavaScript to inject the headers into each row.

Please note that this option will not work in *Core* experience.

##### Scroll

Class: `o-table--responsive-scroll`, Mixin: `oTableResponsiveScroll`

On a narrow viewpoint the Responsive Scroll version will move the headers to the right hand side of the table, and be fixed. This allows the data to be displayed in a column format which would allow the user to swipe left or right going through the data.

##### Overflow

Class: `o-table--responsive-overflow`, Mixin: `oTableResponsiveOverflow`

On a narrow viewpoint, all this does is add an overflow which would allow the user to scroll through the data in a horizontal way. This is identical to the `oTableWrapper` behaviour.

### JavaScript

#### Sorting

Sorting table rows requires the JS part of this component, you can grab this via OBT or the Build Service.

Instantiating an o-table JS component will add click events on the columns to trigger sorting.

If using OBT:

``` js
const OTable = require('o-table');
OTable.init();
```
or
``` js
const OTable = require('o-table');
oTable = new OTable(document.body);
```

Sorting on non-string values such as numbers works if the column type has been declared. E.g. for a column of numbers add the following to `o-table`:
`data-o-table-data-type="number"`.

Other data types for `data-o-table-data-type` include:

| type     | description                                                                                   | examples                                   |
|----------|-----------------------------------------------------------------------------------------------|--------------------------------------------|
| text     | The default, content is sorted as a stirng.                                                   | "Jane Doe", "John Smith"                   |
| date     | Supports the FT style of date and time, including abbreviation.                               | "Aug 17", "1.30am", "April 20 2014 1.30pm" |
| number   | Any number which may include number formatting and abbreviation.                              | "1,200", "100", "3.2", "1bn", "2tn"        |
| percent  | Any percentage with or without the symbol "%".                                                | "3.3%", "200%", "50%"                      |
| currency | Any currency, which may include number formatting, number abbreviation, and currency symbols. | "$84m", "£36bn", "HK$90bn", "Rp14.595"     |
| numeric  | A column which may be treated as numeric which does not fit a more specific type.             | "101 dalmatians"                           |

It is possible to add sort support for a custom `type`. Alternatively, the behaviour of an existing type may be modified.

##### Custom sort (declarative)

If you are wanting to sort by a custom pattern, you can apply the sorting values to each row as a data attribute:
`data-o-table-sort-value=${sort-value}`. These values can be strings or integers.

For example to support a custom date format set `data-o-table-sort-value` to its UNIX Epoch.

``` html
<table class="o-table" data-o-component="o-table">
	<thead>
		<tr>
			<th data-o-table-data-type="date">Custom Date Formats</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td data-o-table-sort-value="1533081600">Wednesday, 1 August 2018</td>
		</tr>
		<tr>
			<td data-o-table-sort-value="1483228800">Jan 2017</td>
		</tr>
		<tr>
			<td data-o-table-sort-value="723168000">1st December 1992</td>
		</tr>
	</tbody>
</table>
```

Or to provide an arbitrary sort order:
``` html
<table class="o-table" data-o-component="o-table">
	<thead>
		<tr>
			<th>Things</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td data-o-table-sort-value=2>snowman</td>
		</tr>
		<tr>
			<td data-o-table-sort-value=3>42</td>
		</tr>
		<tr>
			<td data-o-table-sort-value=1>pangea</td>
		</tr>
	</tbody>
</table>
```

Note: `data-o-table-order` has been deprecated in favour of `data-o-table-sort-value` to specify a sort value.

##### Custom sort (imperative)

Rather than specify `data-o-table-sort-value` [declaritively](#custom-sort-declarative), a formatter function may be provided client-side to generate sort values for a given data type.

For example we could add support for a custom data type `emoji-time`.

``` html
<table class="o-table" data-o-component="o-table">
	<thead>
		<tr>
			<th data-o-table-data-type="emoji-time">Emoji Time</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>🌑</td>
		</tr>
		<tr>
			<td>🌤️️</td>
		</tr>
		<tr>
			<td>🌑</td>
		</tr>
		<tr>
			<td>🌤️️</td>
		</tr>
	</tbody>
</table>
```

To do that call `setSortFormatterForType` with the custom data type and a formatter function.
The formatter accepts the table cell (HTMLElement) and returns a sort value (Number or String) for that cell.
In this case we add support for our custom type `emoji-time` by assigning the emoji a numerical sort value.

``` js
const OTable = require('o-table');
// Set a filter for custom data type "emoji-time".
// The return value may be a string or number.
OTable.setSortFormatterForType('emoji-time', (cell) => {
	const text = cell.textContent.trim();
	if (text === '🌑') {
		return 1;
	}
	if (text === '🌤️️') {
		return 2;
	}
	return 0;
});
OTable.init();
```

Which for an ascending sort, will result in:

```html
<table class="o-table" data-o-component="o-table" data-o-table-order="ASC">
	<thead>
		<tr>
			<th data-o-table-data-type="emoji-time" aria-sort="ascending">Emoji Time</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td data-o-table-sort-value=1>🌑</td>
		</tr>
		<tr>
			<td data-o-table-sort-value=1>🌑</td>
		</tr>
		<tr>
			<td data-o-table-sort-value=2>🌤️️</td>
		</tr>
		<tr>
			<td data-o-table-sort-value=2>🌤️️</td>
		</tr>
	</tbody>
</table>
```

#### Events

The following events are fired by `o-table`.

- `oTable.ready`
- `oTable.sorting`
- `oTable.sorted`

##### oTable.ready

`oTable.ready` fires when the table has been initialised.

The event provides the following properties:
- `detail.oTable` - The initialised `o-table` instance _(oTable)_.

##### oTable.sorted

`oTable.sorted` indicates a table has finished sorting. It includes details of the current sort status of the table.

The event provides the following properties:
- `detail.sort` - The sort e.g. "ASC" _(String)_.
- `detail.columnIndex` - The index of the sorted column heading _(Number)_.
- `detail.oTable` - The effected `o-table` instance _(oTable)_.

```js
document.addEventListener('oTable.sorted', (event) => {
	console.log(`The target table was just sorted by column ${event.detail.columnIndex} in an ${event.detail.sort} order.`);
});
```

##### oTable.sorting

This event is fired just before a table sorts based on user interaction. It may be prevented to implement custom sort functionality. This may be useful to sort a paginated table server-side.

The event provides the following properties:
- `detail.sort` - The sort requested e.g. "ASC" _(String)_.
- `detail.columnIndex` - The index of the column heading which will be sorted _(Number)_.
- `detail.oTable` - The effected `o-table` instance _(oTable)_.

When intercepting the default sort the `sorted` method must be called with relevant parameters when the custom sort is completed.

```js
document.addEventListener('oTable.sorting', (event) => {
	// Prevent default sorting.
	event.preventDefault();
	// Update the table with a custom sort.
	console.log(`Update the table with sorted data here.`);
	// Fire the sorted event, passing along the column index and sort.
	event.detail.oTable.sorted(event.detail.columnIndex, event.detail.sort);
});
```

##### Get The Sorted Column Heading From A Sort Event

`o-table` sort events provide a `columnIndex`. This index maps to a column heading. To retrieve the column heading use `getTableHeader`.

```js
document.addEventListener('oTable.sorting', (event) => {
	const table = event.detail.oTable;
	const columnIndex = event.detail.columnIndex;
	// Get the table header from the column index.
	console.log(table.getTableHeader(columnIndex));
});
```

## Troubleshooting

Known issues:

* IE10 or below need the [polyfill service](https://polyfill.io/)
* IE8 doesn't support the `wrap` function


## Migration guide

### How to upgrade from v4.x.x to v5.x.x?

This major takes the new o-colors and o-typography. Some of the colors and typography have changed slightly from v4 to v5. The font size and line heights of the table data has increased to sit in line with the new typography scale. Some of the colors have changed as there isn't an exact mapping from one color to the other in o-colors.

The `oTableCellContentPrimary` mixin (deprecated in v5) has been removed.
The concrete classes `.primary-data` and `.secondary-data` (deprecated in v5) have been removed.

### How to upgrade from v3.x.x to v4.x.x?

#### Important Changes

- In order to have sorting work correctly, tables need `thead` and `tbody` elements
- The Javascript module now returns an o-table constructor

#### Markup changes

- Wrap the headings in `thead`
- Add `data-o-component="o-table"` to the `table` element of any o-table components which require JS.

---

## Contact

If you have any questions or comments about this component, or need help using it, please either [raise an issue](https://github.com/Financial-Times/o-table/issues), visit [#ft-origami](https://financialtimes.slack.com/messages/ft-origami/) or email [Origami Support](mailto:origami-support@ft.com).

----

## Licence

This software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).
