'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.solveURLParams = exports.toQueryString = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Copyright © 2017 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
var toQueryString = exports.toQueryString = function toQueryString(obj) {
	var parts = (0, _entries2.default)(obj).reduce(function (accumulator, _ref) {
		var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
		    key = _ref2[0],
		    value = _ref2[1];

		return [].concat((0, _toConsumableArray3.default)(accumulator), [encodeURIComponent(key) + '=' + encodeURIComponent(value)]);
	}, []);

	return parts.join('&');
};

var urlParamRegex = /{[^}]+}/;
var solveURLParams = exports.solveURLParams = function solveURLParams(url) {
	var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	if ((0, _keys2.default)(params).length === 0) {
		if (url.match(urlParamRegex)) {
			throw new Error('URL is not completely solved');
		}
		return url;
	}
	var solvedURL = (0, _entries2.default)(params).reduce(function (accumulator, _ref3) {
		var _ref4 = (0, _slicedToArray3.default)(_ref3, 2),
		    key = _ref4[0],
		    value = _ref4[1];

		return accumulator.replace('{' + key + '}', value);
	}, url);

	if (solvedURL.match(urlParamRegex)) {
		throw new Error('URL is not completely solved');
	}

	return encodeURI(solvedURL);
};