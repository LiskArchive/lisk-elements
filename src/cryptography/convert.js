"use strict";
exports.__esModule = true;
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
var browserify_bignum_1 = require("browserify-bignum");
var ed2curve_1 = require("ed2curve");
var hash_1 = require("./hash");
exports.bigNumberToBuffer = function (bignumber, size) {
    return browserify_bignum_1["default"](bignumber).toBuffer({ size: size });
};
exports.bufferToBigNumberString = function (bigNumberBuffer) {
    return browserify_bignum_1["default"].fromBuffer(bigNumberBuffer).toString();
};
exports.bufferToHex = function (buffer) { return naclInstance.to_hex(buffer); };
exports.hexToBuffer = function (hex) { return Buffer.from(hex, 'hex'); };
exports.getFirstEightBytesReversed = function (publicKeyBytes) {
    return Buffer.from(publicKeyBytes)
        .slice(0, 8)
        .reverse();
};
exports.toAddress = function (buffer) { return exports.bufferToBigNumberString(buffer) + "L"; };
exports.getAddressFromPublicKey = function (publicKey) {
    var publicKeyHash = hash_1["default"](publicKey, 'hex');
    var publicKeyTransform = exports.getFirstEightBytesReversed(publicKeyHash);
    var address = exports.toAddress(publicKeyTransform);
    return address;
};
exports.getAddress = exports.getAddressFromPublicKey;
exports.convertPublicKeyEd2Curve = ed2curve_1["default"].convertPublicKey;
exports.convertPrivateKeyEd2Curve = ed2curve_1["default"].convertSecretKey;
