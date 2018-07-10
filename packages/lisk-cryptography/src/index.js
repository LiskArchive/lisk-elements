/*
 * Copyright © 2018 Lisk Foundation
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
import * as convert from './convert';
import * as encrypt from './encrypt';
import hash from './hash';
import * as keys from './keys';
import * as sign from './sign';

export default Object.assign({}, convert, encrypt, { hash }, keys, sign);
