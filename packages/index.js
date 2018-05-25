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
import naclFactory from 'js-nacl';
import APIClient from './api_client';
import cryptography from './cryptography';
import * as constants from './lisk-constants';
import passphrase from './passphrase';
import transaction from './transactions';

global.naclFactory = naclFactory;

global.naclInstance = null;
naclFactory.instantiate(nacl => {
	naclInstance = nacl;
});

export default {
	APIClient,
	cryptography,
	passphrase,
	transaction,
	constants,
};
