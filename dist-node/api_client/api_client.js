'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _liskConstants = require('../lisk-constants');

var _resources = require('./resources');

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
var defaultOptions = {
	bannedNode: [],
	version: '1.0.0',
	minVersion: '>=1.0.0',
	randomizeNode: true
};

var commonHeaders = {
	'Content-Type': 'application/json',
	os: 'lisk-js-api'
};

var getHeaders = function getHeaders(nethash, version, minVersion) {
	return (0, _assign2.default)({}, commonHeaders, {
		nethash: nethash,
		version: version,
		minVersion: minVersion
	});
};

var APIClient = function () {
	function APIClient(nodes, nethash) {
		var providedOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
		(0, _classCallCheck3.default)(this, APIClient);

		this.initialize(nodes, nethash, providedOptions);

		this.accounts = new _resources.AccountsResource(this);
		this.blocks = new _resources.BlocksResource(this);
		this.dapps = new _resources.DappsResource(this);
		this.delegates = new _resources.DelegatesResource(this);
		this.node = new _resources.NodeResource(this);
		this.peers = new _resources.PeersResource(this);
		this.signatures = new _resources.SignaturesResource(this);
		this.transactions = new _resources.TransactionsResource(this);
		this.voters = new _resources.VotersResource(this);
		this.votes = new _resources.VotesResource(this);
	}

	(0, _createClass3.default)(APIClient, [{
		key: 'initialize',
		value: function initialize(nodes, nethash) {
			var providedOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			if (!Array.isArray(nodes) || nodes.length <= 0) {
				throw new Error('APIClient requires nodes for initialization.');
			}

			if (typeof nethash !== 'string' || nethash === '') {
				throw new Error('APIClient requires nethash for initialization.');
			}

			var options = (0, _assign2.default)({}, defaultOptions, providedOptions);

			this.headers = getHeaders(nethash, options.version, options.minVersion);
			this.nodes = nodes;
			this.bannedNodes = [].concat((0, _toConsumableArray3.default)(options.bannedNodes || []));
			this.currentNode = options.node || this.getNewNode();
			this.randomizeNodes = options.randomizeNodes !== false;
		}
	}, {
		key: 'getNewNode',
		value: function getNewNode() {
			var _this = this;

			var nodes = this.nodes.filter(function (node) {
				return !_this.isBanned(node);
			});

			if (nodes.length === 0) {
				throw new Error('Cannot get new node: all nodes have been banned.');
			}

			var randomIndex = Math.floor(Math.random() * nodes.length);
			return nodes[randomIndex];
		}
	}, {
		key: 'banNode',
		value: function banNode(node) {
			if (!this.isBanned(node)) {
				this.bannedNodes.push(node);
				return true;
			}
			return false;
		}
	}, {
		key: 'banActiveNode',
		value: function banActiveNode() {
			return this.banNode(this.currentNode);
		}
	}, {
		key: 'banActiveNodeAndSelect',
		value: function banActiveNodeAndSelect() {
			var banned = this.banActiveNode();
			if (banned) {
				this.currentNode = this.getNewNode();
			}
			return banned;
		}
	}, {
		key: 'hasAvailableNodes',
		value: function hasAvailableNodes() {
			var _this2 = this;

			return this.nodes.some(function (node) {
				return !_this2.isBanned(node);
			});
		}
	}, {
		key: 'isBanned',
		value: function isBanned(node) {
			return this.bannedNodes.includes(node);
		}
	}], [{
		key: 'createMainnetAPIClient',
		value: function createMainnetAPIClient(options) {
			return new APIClient(_liskConstants.MAINNET_NODES, _liskConstants.MAINNET_NETHASH, options);
		}
	}, {
		key: 'createTestnetAPIClient',
		value: function createTestnetAPIClient(options) {
			return new APIClient(_liskConstants.TESTNET_NODES, _liskConstants.TESTNET_NETHASH, options);
		}
	}, {
		key: 'createBetanetAPIClient',
		value: function createBetanetAPIClient(options) {
			return new APIClient(_liskConstants.BETANET_NODES, _liskConstants.BETANET_NETHASH, options);
		}
	}]);
	return APIClient;
}();

exports.default = APIClient;