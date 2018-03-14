'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _cryptography = require('../cryptography');

var _cryptography2 = _interopRequireDefault(_cryptography);

var _constants = require('./constants');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var castVotes = function castVotes(_ref) {
	var passphrase = _ref.passphrase,
	    _ref$votes = _ref.votes,
	    votes = _ref$votes === undefined ? [] : _ref$votes,
	    _ref$unvotes = _ref.unvotes,
	    unvotes = _ref$unvotes === undefined ? [] : _ref$unvotes;

	(0, _utils.validatePublicKeys)([].concat((0, _toConsumableArray3.default)(votes), (0, _toConsumableArray3.default)(unvotes)));

	var recipientId = passphrase ? _cryptography2.default.getAddressAndPublicKeyFromPassphrase(passphrase).address : null;

	var plusPrependedVotes = (0, _utils.prependPlusToPublicKeys)(votes);
	var minusPrependedUnvotes = (0, _utils.prependMinusToPublicKeys)(unvotes);
	var allVotes = [].concat((0, _toConsumableArray3.default)(plusPrependedVotes), (0, _toConsumableArray3.default)(minusPrependedUnvotes));

	return {
		type: 3,
		fee: _constants.VOTE_FEE.toString(),
		recipientId: recipientId,
		asset: {
			votes: allVotes
		}
	};
}; /*
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
exports.default = (0, _utils.wrapTransactionCreator)(castVotes);