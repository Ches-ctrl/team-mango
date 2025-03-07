function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * Convert row label to index.
 *
 * @param {String} label Row label (eq. '1', '5')
 * @returns {Number} Returns -1 if label is not recognized otherwise proper row index.
 */
export function rowLabelToIndex(label) {
  var result = parseInt(label, 10);

  if (isNaN(result)) {
    result = -1;
  } else {
    result = Math.max(result - 1, -1);
  }

  return result;
}
/**
 * Convert row index to label.
 *
 * @param {Number} row Row index.
 * @returns {String} Returns row label (eq. '1', '7').
 */

export function rowIndexToLabel(row) {
  var result = "";

  if (row >= 0) {
    result = "".concat(row + 1);
  }

  return result;
}
var COLUMN_LABEL_BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var COLUMN_LABEL_BASE_LENGTH = COLUMN_LABEL_BASE.length;
/**
 * Convert column label to index.
 *
 * @param {String} label Column label (eq. 'ABB', 'CNQ')
 * @returns {Number} Returns -1 if label is not recognized otherwise proper column index.
 */

export function columnLabelToIndex(label) {
  var result = 0;

  if (typeof label === "string") {
    label = label.toUpperCase();

    for (var i = 0, j = label.length - 1; i < label.length; i += 1, j -= 1) {
      result += Math.pow(COLUMN_LABEL_BASE_LENGTH, j) * (COLUMN_LABEL_BASE.indexOf(label[i]) + 1);
    }
  }

  --result;
  return result;
}
/**
 * Convert column index to label.
 *
 * @param {Number} column Column index.
 * @returns {String} Returns column label (eq. 'ABB', 'CNQ').
 */

export function columnIndexToLabel(column) {
  var result = "";

  while (column >= 0) {
    result = String.fromCharCode(column % COLUMN_LABEL_BASE_LENGTH + 97) + result;
    column = Math.floor(column / COLUMN_LABEL_BASE_LENGTH) - 1;
  }

  return result.toUpperCase();
}
var simpleSheetName = "[A-Za-z0-9_\xC0-\u02AF]+";
var quotedSheetName = "'(?:(?!').|'')*'";
var sheetNameRegexp = "(".concat(simpleSheetName, "|").concat(quotedSheetName, ")!");
var LABEL_EXTRACT_REGEXP = new RegExp("^(?:".concat(sheetNameRegexp, ")?([$])?([A-Za-z]*)([$])?([0-9]*)$"));
/**
 * Extract cell coordinates.
 *
 * @param {String} label Cell coordinates (eq. 'A1', '$B6', '$N$98').
 * @returns {Array} Returns an array of objects.
 */

export function extractLabel(label) {
  if (typeof label !== "string" || !LABEL_EXTRACT_REGEXP.test(label)) {
    return [];
  }

  var _label$toUpperCase$ma = label.toUpperCase().match(LABEL_EXTRACT_REGEXP),
      _label$toUpperCase$ma2 = _slicedToArray(_label$toUpperCase$ma, 6),
      sheetNameStr = _label$toUpperCase$ma2[1],
      columnAbs = _label$toUpperCase$ma2[2],
      column = _label$toUpperCase$ma2[3],
      rowAbs = _label$toUpperCase$ma2[4],
      row = _label$toUpperCase$ma2[5];

  if (column == null && row == null) return [];
  var sheetName = sheetNameStr == null ? null : label.slice(0, sheetNameStr.length).replace(/^'|'$/g, "").replace(/''/g, "'");
  return [{
    index: rowLabelToIndex(row),
    label: row,
    isAbsolute: rowAbs === "$"
  }, {
    index: columnLabelToIndex(column),
    label: column,
    isAbsolute: columnAbs === "$"
  }, sheetName];
}
/**
 * Convert row and column indexes into cell label.
 *
 * @param {Object} row Object with `index` and `isAbsolute` properties.
 * @param {Object} column Object with `index` and `isAbsolute` properties.
 * @returns {String} Returns cell label.
 */

export function toLabel(row, column) {
  var rowLabel = (row.isAbsolute ? "$" : "") + rowIndexToLabel(row.index);
  var columnLabel = (column.isAbsolute ? "$" : "") + columnIndexToLabel(column.index);
  return columnLabel + rowLabel;
}