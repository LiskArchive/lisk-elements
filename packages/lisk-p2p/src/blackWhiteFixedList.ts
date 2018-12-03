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
import { Peer } from './peer';

export interface PeerConfig {
	readonly blacklist: ReadonlyArray<Peer>;
	readonly fixedPeers: ReadonlyArray<Peer>;
	readonly whitelist: ReadonlyArray<Peer>;
}

export interface SelectedPeerList {
	readonly blacklist: ReadonlyArray<Peer>;
	readonly newPeers: ReadonlyArray<Peer>;
	readonly triedPeers: ReadonlyArray<Peer>;
}
// TODO
export const setInitialPeers = (peerConfig: PeerConfig): SelectedPeerList => {
	const allPeers: ReadonlyArray<Peer> = [
		...peerConfig.fixedPeers,
		...peerConfig.whitelist,
	];
	// Get all the blacklist IpAddresses
	const blackListIDs = peerConfig.blacklist.reduce(
		(blackListIpList: ReadonlyArray<string>, blacklistPeer) => [
			...blackListIpList,
			blacklistPeer.ipAddress,
		],
		[],
	);
	// Filter all the peers based on blacklist and remove the duplicates
	const initialPeers = allPeers
		.filter((peer: Peer) => !blackListIDs.includes(peer.ipAddress))
		.reduce<ReadonlyArray<Peer>>((uniquePeersArray, peer) => {
			const found = uniquePeersArray.find(
				findPeer => findPeer.ipAddress === peer.ipAddress,
			);

			if (found) {
				return uniquePeersArray;
			}

			return [...uniquePeersArray, peer];
		}, []);

	return {
		blacklist: peerConfig.blacklist,
		newPeers: initialPeers,
		triedPeers: [],
	};
};
