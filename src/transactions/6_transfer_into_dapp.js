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
import { IN_TRANSFER_FEE } from './constants';
import { wrapTransactionCreator } from './utils';

const transferIntoDapp = ({ amount, dappId }) => ({
	type: 6,
	amount: amount.toString(),
	fee: IN_TRANSFER_FEE.toString(),
	asset: {
		inTransfer: {
			dappId,
		},
	},
});

export default wrapTransactionCreator(transferIntoDapp);
