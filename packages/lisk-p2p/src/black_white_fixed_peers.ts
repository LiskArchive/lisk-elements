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
import { PeerInfo } from './peer';
import { PeerBucket } from './peer_bucket';

// This module handles black white and fixed lists according to P2P LIP.
// It takes these peer lists from config file and returns list of tried and new Peers based on the list and in accordance to LIP.

export interface PeerLists {
	readonly blacklist: ReadonlyArray<PeerInfo>;
	readonly fixedlist: ReadonlyArray<PeerInfo>;
	readonly whitelist: ReadonlyArray<PeerInfo>;
}

// TODO: Get a list of all lists and make RPC calls to getNodeStatus and create peerconfig objects
export const setInitialPeers = (
	peerLists: PeerLists,
	peerBucket: PeerBucket,
): PeerBucket => {
	// Get all the blacklist IpAddresses
	const blackListIDs = peerLists.blacklist.reduce(
		(blackListIpList: ReadonlyArray<string>, blacklistPeer) => [
			...blackListIpList,
			blacklistPeer.ipAddress,
		],
		[],
	);
	// Filter all the peers based on blacklist and remove the duplicates
	const fixedlistRefined = peerLists.fixedlist.filter(
		(peer: PeerInfo) => !blackListIDs.includes(peer.ipAddress),
	);

	const whitelistRefined = peerLists.whitelist.filter(
		(peer: PeerInfo) => !blackListIDs.includes(peer.ipAddress),
	);

	fixedlistRefined.forEach(peer => {
		peerBucket.addToTriedPeers(peer);
	});

	whitelistRefined.forEach(peer => {
		peerBucket.addToTriedPeers(peer);
	});

	return peerBucket;
};
