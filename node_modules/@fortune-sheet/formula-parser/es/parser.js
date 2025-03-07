function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

import Emitter from "tiny-emitter";
import evaluateByOperator from "./evaluate-by-operator/evaluate-by-operator";
import { Parser as GrammarParser } from "./grammar-parser/grammar-parser";
import { trimEdges } from "./helper/string";
import { toNumber, invertNumber } from "./helper/number";
import errorParser, { isValidStrict as isErrorValid, ERROR, ERROR_NAME, ERROR_VALUE } from "./error";
import { extractLabel, toLabel } from "./helper/cell";
/**
 * @class Parser
 */

var Parser = /*#__PURE__*/function (_Emitter) {
  _inherits(Parser, _Emitter);

  var _super = _createSuper(Parser);

  function Parser() {
    var _this;

    _classCallCheck(this, Parser);

    _this = _super.call(this);
    _this.parser = new GrammarParser();
    _this.parser.yy = {
      toNumber: toNumber,
      trimEdges: trimEdges,
      invertNumber: invertNumber,
      throwError: function throwError(errorName) {
        return _this._throwError(errorName);
      },
      callVariable: function callVariable(variable) {
        return _this._callVariable(variable);
      },
      evaluateByOperator: evaluateByOperator,
      callFunction: function callFunction(name, params) {
        return _this._callFunction(name, params);
      },
      cellValue: function cellValue(value) {
        return _this._callCellValue(value);
      },
      rangeValue: function rangeValue(start, end) {
        return _this._callRangeValue(start, end);
      }
    };
    _this.variables = Object.create(null);
    _this.functions = Object.create(null);
    _this.options = Object.create(null);

    _this.setVariable("TRUE", true).setVariable("FALSE", false).setVariable("NULL", null);

    return _this;
  }
  /**
   * Parse formula expression.
   *
   * @param {string} expression to parse.
   * @param {object} options additional params.
   * @param {string} options.sheetId id of sheet which the formula expression belongs to.
   * @return {*} Returns an object with tow properties `error` and `result`.
   */


  _createClass(Parser, [{
    key: "parse",
    value: function parse(expression, options) {
      var result = null;
      var error = null;
      this.options = options;

      try {
        if (expression === "") {
          result = "";
        } else {
          result = this.parser.parse(expression);
        }
      } catch (ex) {
        var message = errorParser(ex.message);

        if (message) {
          error = message;
        } else {
          error = errorParser(ERROR);
        }
      }

      if (result instanceof Error) {
        error = errorParser(result.message) || errorParser(ERROR);
        result = null;
      }

      return {
        error: error,
        result: result
      };
    }
    /**
     * Set predefined variable name which can be visible while parsing formula expression.
     *
     * @param {String} name Variable name.
     * @param {*} value Variable value.
     * @returns {Parser}
     */

  }, {
    key: "setVariable",
    value: function setVariable(name, value) {
      this.variables[name] = value;
      return this;
    }
    /**
     * Get variable name.
     *
     * @param {String} name Variable name.
     * @returns {*}
     */

  }, {
    key: "getVariable",
    value: function getVariable(name) {
      return this.variables[name];
    }
    /**
     * Retrieve variable value by its name.
     *
     * @param name Variable name.
     * @returns {*}
     * @private
     */

  }, {
    key: "_callVariable",
    value: function _callVariable(name) {
      var value = this.getVariable(name);
      this.emit("callVariable", name, function (newValue) {
        if (newValue !== void 0) {
          value = newValue;
        }
      });

      if (value === void 0) {
        throw Error(ERROR_NAME);
      }

      return value;
    }
    /**
     * Set custom function which can be visible while parsing formula expression.
     *
     * @param {String} name Custom function name.
     * @param {Function} fn Custom function.
     * @returns {Parser}
     */

  }, {
    key: "setFunction",
    value: function setFunction(name, fn) {
      this.functions[name] = fn;
      return this;
    }
    /**
     * Get custom function.
     *
     * @param {String} name Custom function name.
     * @returns {*}
     */

  }, {
    key: "getFunction",
    value: function getFunction(name) {
      return this.functions[name];
    }
    /**
     * Call function with provided params.
     *
     * @param name Function name.
     * @param params Function params.
     * @returns {*}
     * @private
     */

  }, {
    key: "_callFunction",
    value: function _callFunction(name) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var fn = this.getFunction(name);
      var value;

      if (fn) {
        value = fn(params);
      }

      this.emit("callFunction", name, params, function (newValue) {
        if (newValue !== void 0) {
          value = newValue;
        }
      });
      return value === void 0 ? evaluateByOperator(name, params) : value;
    }
    /**
     * Retrieve value by its label (`B3`, `B$3`, `B$3`, `$B$3`).
     *
     * @param {String} label Coordinates.
     * @returns {*}
     * @private
     */

  }, {
    key: "_callCellValue",
    value: function _callCellValue(label) {
      var _extractLabel = extractLabel(label),
          _extractLabel2 = _slicedToArray(_extractLabel, 3),
          row = _extractLabel2[0],
          column = _extractLabel2[1],
          sheetName = _extractLabel2[2];

      if ((column === null || column === void 0 ? void 0 : column.index) === -1) {
        if (row.isAbsolute || column.isAbsolute) {
          throw Error(ERROR_NAME);
        }

        return row.index + 1;
      } else if ((row === null || row === void 0 ? void 0 : row.index) === -1) {
        throw Error(ERROR_NAME);
      }

      var value = void 0;
      this.emit("callCellValue", {
        label: label,
        row: row,
        column: column,
        sheetName: sheetName
      }, this.options, function (_value) {
        value = _value;
      });
      return value;
    }
    /**
     * Retrieve value by its label (`B3:A1`, `B$3:A1`, `B$3:$A1`, `$B$3:A$1`).
     *
     * @param {String} startLabel Coordinates of the first cell.
     * @param {String} endLabel Coordinates of the last cell.
     * @returns {Array} Returns an array of mixed values.
     * @private
     */

  }, {
    key: "_callRangeValue",
    value: function _callRangeValue(startLabel, endLabel) {
      var _extractLabel3 = extractLabel(startLabel),
          _extractLabel4 = _slicedToArray(_extractLabel3, 3),
          startRow = _extractLabel4[0],
          startColumn = _extractLabel4[1],
          startSheetName = _extractLabel4[2];

      var _extractLabel5 = extractLabel(endLabel),
          _extractLabel6 = _slicedToArray(_extractLabel5, 3),
          endRow = _extractLabel6[0],
          endColumn = _extractLabel6[1],
          endSheetName = _extractLabel6[2];

      if (endSheetName != null && startSheetName != endSheetName) {
        throw Error(ERROR_VALUE);
      }

      var startCell = {};
      var endCell = {};
      startCell.sheetName = startSheetName;

      if (startRow.index <= endRow.index) {
        startCell.row = startRow;
        endCell.row = endRow;
      } else {
        startCell.row = endRow;
        endCell.row = startRow;
      }

      if (startColumn.index <= endColumn.index) {
        startCell.column = startColumn;
        endCell.column = endColumn;
      } else {
        startCell.column = endColumn;
        endCell.column = startColumn;
      }

      startCell.label = toLabel(startCell.row, startCell.column);
      endCell.label = toLabel(endCell.row, endCell.column);
      var value = [];
      this.emit("callRangeValue", startCell, endCell, this.options, function () {
        var _value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        value = _value;
      });
      return value;
    }
    /**
     * Try to throw error by its name.
     *
     * @param {String} errorName Error name.
     * @returns {String}
     * @private
     */

  }, {
    key: "_throwError",
    value: function _throwError(errorName) {
      if (isErrorValid(errorName)) {
        throw Error(errorName);
      }

      throw Error(ERROR);
    }
  }]);

  return Parser;
}(Emitter);

export default Parser;