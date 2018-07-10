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
import { DAPP_FEE } from './constants';
import { wrapTransactionCreator } from './utils';

const isInt = n => parseInt(n, 10) === n;

const validateOptions = options => {
	if (typeof options !== 'object') {
		throw new Error('Options must be an object.');
	}
	const { category, name, type, link } = options;

	if (!isInt(category)) {
		throw new Error('Dapp category must be an integer.');
	}
	if (typeof name !== 'string') {
		throw new Error('Dapp name must be a string.');
	}
	if (!isInt(type)) {
		throw new Error('Dapp type must be an integer.');
	}
	if (typeof link !== 'string') {
		throw new Error('Dapp link must be a string.');
	}
};

const createDapp = ({ options }) => {
	validateOptions(options);

	return {
		type: 5,
		fee: DAPP_FEE.toString(),
		asset: {
			dapp: {
				category: options.category,
				name: options.name,
				description: options.description,
				tags: options.tags,
				type: options.type,
				link: options.link,
				icon: options.icon,
			},
		},
	};
};

export default wrapTransactionCreator(createDapp);
