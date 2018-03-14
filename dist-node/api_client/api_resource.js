'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _popsicle = require('popsicle');

var popsicle = _interopRequireWildcard(_popsicle);

var _constants = require('./constants');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

var APIResource = function () {
	function APIResource(apiClient) {
		(0, _classCallCheck3.default)(this, APIResource);

		if (!apiClient) {
			throw new Error('APIResource requires APIClient instance for initialization.');
		}
		this.apiClient = apiClient;
		this.path = '';
	}

	(0, _createClass3.default)(APIResource, [{
		key: 'request',
		value: function request(req, retry) {
			var _this = this;

			var retryCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

			var request = popsicle.request(req).use(popsicle.plugins.parse(['json', 'urlencoded'])).then(function (res) {
				if (res.status >= 300) {
					if (res.body && res.body.message) {
						throw new Error('Status ' + res.status + ' : ' + res.body.message);
					}
					throw new Error('Status ' + res.status + ' : An unknown error has occurred.');
				}
				return res.body;
			});

			if (retry) {
				request.catch(function (err) {
					return _this.handleRetry(err, req, retryCount);
				});
			}
			return request;
		}
	}, {
		key: 'handleRetry',
		value: function handleRetry(error, req, retryCount) {
			var _this2 = this;

			if (this.apiClient.hasAvailableNodes()) {
				return new _promise2.default(function (resolve) {
					return setTimeout(resolve, 1000);
				}).then(function () {
					if (_this2.apiClient.randomizeNodes) {
						_this2.apiClient.banActiveNodeAndSelect();
					} else if (retryCount > _constants.API_RECONNECT_MAX_RETRY_COUNT) {
						throw error;
					}
					return _this2.request(req, true, retryCount + 1);
				});
			}
			return _promise2.default.reject(error);
		}
	}, {
		key: 'headers',
		get: function get() {
			return this.apiClient.headers;
		}
	}, {
		key: 'resourcePath',
		get: function get() {
			return this.apiClient.currentNode + '/api' + this.path;
		}
	}]);
	return APIResource;
}();

exports.default = APIResource;