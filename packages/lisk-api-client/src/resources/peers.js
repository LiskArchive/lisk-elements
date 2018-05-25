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

import { GET } from '../constants';
import apiMethod from '../api_method';
import APIResource from '../api_resource';

export default class PeersResource extends APIResource {
	constructor(apiClient) {
		super(apiClient);
		this.path = '/peers';

		this.get = apiMethod({
			method: GET,
		}).bind(this);
	}
}
