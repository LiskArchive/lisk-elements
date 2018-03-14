'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _constants = require('./constants');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Bind to resource class
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

var apiMethod = function apiMethod() {
	var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	    _ref$method = _ref.method,
	    method = _ref$method === undefined ? _constants.GET : _ref$method,
	    _ref$path = _ref.path,
	    path = _ref$path === undefined ? '' : _ref$path,
	    _ref$urlParams = _ref.urlParams,
	    urlParams = _ref$urlParams === undefined ? [] : _ref$urlParams,
	    _ref$validator = _ref.validator,
	    validator = _ref$validator === undefined ? null : _ref$validator,
	    _ref$defaultData = _ref.defaultData,
	    defaultData = _ref$defaultData === undefined ? {} : _ref$defaultData,
	    _ref$retry = _ref.retry,
	    retry = _ref$retry === undefined ? false : _ref$retry;

	return function apiHandler() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		if (urlParams.length > 0 && args.length < urlParams.length) {
			return _promise2.default.reject(new Error('This endpoint must be supplied with the following parameters: ' + urlParams.toString()));
		}

		var data = (0, _assign2.default)({}, defaultData, args.length > urlParams.length && (0, _typeof3.default)(args[urlParams.length]) === 'object' ? args[urlParams.length] : {});

		if (validator) {
			try {
				validator(data);
			} catch (err) {
				return _promise2.default.reject(err);
			}
		}

		var resolvedURLObject = urlParams.reduce(function (accumulator, param, i) {
			return (0, _assign2.default)({}, accumulator, (0, _defineProperty3.default)({}, param, args[i]));
		}, {});

		var requestData = {
			method: method,
			url: (0, _utils.solveURLParams)('' + this.resourcePath + path, resolvedURLObject),
			headers: this.headers
		};

		if ((0, _keys2.default)(data).length > 0) {
			if (method === _constants.GET) {
				requestData.url += '?' + (0, _utils.toQueryString)(data);
			} else {
				requestData.body = data;
			}
		}
		return this.request(requestData, retry);
	};
};

exports.default = apiMethod;