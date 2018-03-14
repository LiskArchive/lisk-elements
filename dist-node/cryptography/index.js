'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _convert = require('./convert');

var convert = _interopRequireWildcard(_convert);

var _encrypt = require('./encrypt');

var encrypt = _interopRequireWildcard(_encrypt);

var _hash = require('./hash');

var _hash2 = _interopRequireDefault(_hash);

var _keys = require('./keys');

var keys = _interopRequireWildcard(_keys);

var _sign = require('./sign');

var sign = _interopRequireWildcard(_sign);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _assign2.default)({}, convert, encrypt, { hash: _hash2.default }, keys, sign); /*
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