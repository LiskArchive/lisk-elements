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
 * @flow
 */

declare type Options = {
	ssl: boolean,
	node: string,
	randomPeer: boolean,
	testnet: boolean,
	port: string,
	bannedPeers: Array<string>,
	nethash: NethashOption,
};

declare type NethashOption = {
	'Content-Type': string,
	nethash: string,
	broadhash: string,
	os: string,
	version: string,
	minVersion: string,
	port: string,
	Accept: string,
};

declare type NethashOptions = {
	mainnet: NethashOption,
	testnet: NethashOption,
};
