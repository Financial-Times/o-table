# o-table [![Build Status](https://circleci.com/gh/Financial-Times/o-table.png?style=shield&circle-token=6c1d4241aefb825cb3870d5294e09dd370240c64)](https://circleci.com/gh/Financial-Times/o-table)
=================

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
<table class="o-table">
	...
</table>
```

Where a `td` contains numeric data, or a `th` is for cells containing numeric data, you may also add the class `.o-table__cell--numeric`. Additionally add the `data-o-table-data-type="numeric"` attribute to the `th` to allow the column to be sorted numerically:

```html
<table class="o-table">
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
	</tbody>
	...
</table>
```

Where table headings (`th`) are used as row headings, `scope="row"` attributes must be set on the `th`:

```html
<table class="o-table">
	<tr>
		<th scope="row">FTSE 100</th>
		<td data-o-table-data-type="numeric" class="o-table__cell--numeric">6685.52</td>
	</tr>
	...
</table>
```

`thead` and `tbody` tags should be used in your markup and where appropriate `tfoot` should also be used. Each of these elements must contain `tr` children to wrap any `td` or `th` element:

```html
<table class="o-table">
	<thead>
		<tr>
			<th>Index</th>
			<th data-o-table-data-type="numeric" class="o-table__cell--numeric">Value</th>
		</tr>
	</thead>
	<tfoot>
		<tr>
			<td colspan="2">footer content</td>
		</tr>
	</tfoot>
	<tbody>
		<tr>
			<td>FTSE 100</td>
			<td data-o-table-data-type="numeric" class="o-table__cell--numeric">6685.52</td>
		</tr>
		...
	</tbody>
</table>
```

#### Small screen rendering

Where there is not enough horizontal space for a table to fit, it can be made horizontally scrollable by wrapping it in an element with a class of `o-table-wrapper`:

```html
<div class="o-table-wrapper">
	<table class="o-table">
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

#### Themes

Themes allow Bower and Build Service users to request `o-table` with a different look and feel. Default themes include:

1. primary - The primary FT brand, which includes uses of the FT paper colour.
2. internal - A more neutral theme useful for internal products, tooling, or tech documentation.

Using themes is not required and mixins can continue to be used without setting a theme, however doing so is a quick way to customise the look and feel of `o-table`. For base styles, which outputs minimal css, leave the theme unset.

##### Origami Build Service Users

To set the theme modify your Origami Build Service request to include your desired theme e.g. `o-table@^6.2.1:primary`. If the theme is not set or found only base styles will be returned.

##### Bower Users

To use a default theme set `$o-table-theme` to the theme you would like to use, e.g. `$o-table-theme: 'primary';`. 

If you are a Bower user you may also configure your own theme.

```sass
$o-table-theme: 'my-theme';
@include oTableThemeSetTheme('my-theme', (
	stripes: (
		background: oColorsGetColorFor(o-table-row-primary o-table-row page, background),
		alt-background: oColorsGetColorFor(o-table-row-alt-primary o-table-row-alt page, background)
	)
));
```

Now calling `@include oTableAll` will output using your theme configuration. Alternatively in [silent mode](#silent-mode) you may use your chosen theme per mixin.

```sass
.my-table {
	$strip-config: oTableThemeGetFor($theme:$o-table-theme, $state:'stripes');
	@include oTableRowStripes($strip-config...);
}
```

#### Variant classes and placeholders

Additional classes may be added to the table root element to also apply the following styling options. They can be combined as required.

#### Content styles

Class: `.o-table__multi-level-header`

Adds styles to a multi-level table header, i.e. a header of a header. A multi-level header should span columns and be within the first row of a table header (`thead > tr:first-child > th[colspan][scope="colgroup"].o-table__multi-level-header`).

The responsive scroll and flat table variants do not support multi level headers on mobile.

Class: `o-table__cell--content-secondary`, Mixin: `oTableCellContentSecondary`

Reduce the size of some text in a cell and display block to start a new line. The class should be applied to a `<span>` or `<div>` element inside of the table cell.

#### Row stripes

Class: `o-table--row-stripes` _(themes: primary, internal)_

Mixin: `oTableRowStripes`

A background colour will be set on the whole table, and alternate rows within the `tbody` will have their background colour set.

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

Sorting numbers works if the column has been declared as a numeric column via `data-o-table-data-type="numeric"`.

##### Sorting declaratively
If you are wanting to sort by a custom pattern, you can apply the sorting values to each row as a data attribute:
`data-o-table-order=${sort-position}`. These values can be strings or integers.

``` html
<table class="o-table" data-o-component="o-table">
	<thead>
		<tr>
			<th>Things</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td data-o-table-order=2>snowman</td>
		</tr>
		<tr>
			<td data-o-table-order=3>42</td>
		</tr>
		<tr>
			<td data-o-table-order=1>pangea</td>
		</tr>
	</tbody>
</table>
```

## Troubleshooting

Known issues:

* IE10 or below need the [polyfill service](https://polyfill.io/)
* IE8 doesn't support the `wrap` function


## Migration guide

### How to upgrade from v6.x.x to v7.x.x?

- Themes have been introduced and should be set as needed to retain the correct look and feel, see [theme documentation](#themes).
- The following colour usecases must be updated:
	- `o-table-striped` is now `o-table-row-primary`.
	- `o-table-row-alt` is now `o-table-row-alt-primary`.
	- `o-table-row-right` has been removed, `o-table-row` is a suitable alternative.
- `thead` elements must have `tr` children i.e. `thead > tr > th`.
- The data attribute `data-o-table--js`, which is automatically set with JavaScript when the table is instantiated, is now `data-o-table-js`.
- The default vertical lines have been removed from the flat responsive variant (`.o-table--responsive-flat` `oTableResponsiveFlat()`) but these can be reinstated if required using the vertical lines class `.o-table--vertical-lines` or mixin `oTableVerticalLines()`.

### How to upgrade from v5.x.x to v6.x.x?

This major takes the new o-colors and o-typography. Some of the colors and typography have changed slightly from v4 to v5. The font size and line heights of the table data has increased to sit in line with the new typography scale. Some of the colors have changed as there isn't an exact mapping from one color to the other in o-colors.

The `oTableCellContentPrimary` mixin (deprecated in v5) has been removed.
The concrete classes `.primary-data` and `.secondary-data` (deprecated in v5) have been removed.


### How to upgrade from v4.x.x to v5.x.x?

To support new responsive tables this major introduces a dependency on `o-grid`. Confirm this version of `o-grid` is compatible with other dependencies in your project.

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
