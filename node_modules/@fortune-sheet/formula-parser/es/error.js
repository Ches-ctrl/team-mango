var _errors;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

export var ERROR = "ERROR";
export var ERROR_DIV_ZERO = "DIV/0";
export var ERROR_NAME = "NAME";
export var ERROR_NOT_AVAILABLE = "N/A";
export var ERROR_NULL = "NULL";
export var ERROR_NUM = "NUM";
export var ERROR_REF = "REF";
export var ERROR_VALUE = "VALUE";
var errors = (_errors = {}, _defineProperty(_errors, ERROR, "#ERROR!"), _defineProperty(_errors, ERROR_DIV_ZERO, "#DIV/0!"), _defineProperty(_errors, ERROR_NAME, "#NAME?"), _defineProperty(_errors, ERROR_NOT_AVAILABLE, "#N/A"), _defineProperty(_errors, ERROR_NULL, "#NULL!"), _defineProperty(_errors, ERROR_NUM, "#NUM!"), _defineProperty(_errors, ERROR_REF, "#REF!"), _defineProperty(_errors, ERROR_VALUE, "#VALUE!"), _errors);
/**
 * Return error type based on provided error id.
 *
 * @param {String} type Error type.
 * @returns {String|null} Returns error id.
 */

export default function error(type) {
  var result;
  type = (type + "").replace(/#|!|\?/g, "");

  if (errors[type]) {
    result = errors[type];
  }

  return result ? result : null;
}
/**
 * Check if error type is strict valid with knows errors.
 *
 * @param {String} Error type.
 * @return {Boolean}
 */

export function isValidStrict(type) {
  var valid = false;

  for (var i in errors) {
    if (Object.prototype.hasOwnProperty.call(errors, i) && errors[i] === type) {
      valid = true;
      break;
    }
  }

  return valid;
}