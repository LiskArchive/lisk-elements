'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _constants = require('../constants');

var _api_method = require('../api_method');

var _api_method2 = _interopRequireDefault(_api_method);

var _api_resource = require('../api_resource');

var _api_resource2 = _interopRequireDefault(_api_resource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DelegatesResource = function (_APIResource) {
	(0, _inherits3.default)(DelegatesResource, _APIResource);

	function DelegatesResource(apiClient) {
		(0, _classCallCheck3.default)(this, DelegatesResource);

		var _this = (0, _possibleConstructorReturn3.default)(this, (DelegatesResource.__proto__ || (0, _getPrototypeOf2.default)(DelegatesResource)).call(this, apiClient));

		_this.path = '/delegates';

		_this.get = (0, _api_method2.default)({
			method: _constants.GET
		}).bind(_this);

		_this.getStandby = (0, _api_method2.default)({
			method: _constants.GET,
			defaultData: {
				sort: 'rate:asc',
				offset: 101
			}
		}).bind(_this);

		_this.getForgers = (0, _api_method2.default)({
			method: _constants.GET,
			path: '/forgers'
		}).bind(_this);

		_this.getForgingStatistics = (0, _api_method2.default)({
			method: _constants.GET,
			path: '/{address}/forging_statistics',
			urlParams: ['address']
		}).bind(_this);
		return _this;
	}

	return DelegatesResource;
}(_api_resource2.default); /*
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

exports.default = DelegatesResource;