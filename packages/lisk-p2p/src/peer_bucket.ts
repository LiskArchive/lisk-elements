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
/* tslint:disable: prefer-function-over-method no-unused-variable */
import { PeerInfo } from './peer';

export class PeerBucket {
	private readonly _bannedPeers: ReadonlyArray<PeerInfo>;
	private readonly _newPeers: Map<number, Set<PeerInfo>>;
	private readonly _triedPeers: Map<number, Set<PeerInfo>>;

	public constructor() {
		this._newPeers = new Map();
		this._triedPeers = new Map();
		this._bannedPeers = [];
	}

	public get newPeers(): Map<number, Set<PeerInfo>> {
		return this._newPeers;
	}

	public get triedPeers(): Map<number, Set<PeerInfo>> {
		return this._newPeers;
	}

	public get bannedPeers(): ReadonlyArray<PeerInfo> {
		return this._bannedPeers;
	}
	// TODO: Add logic to calculate bucket and add it to bucket group based on LIPS
	public calculateNewPeerBucketGroup(peerInfo: PeerInfo): number {
		// TODO: Based on IP, IP prefix and hash of random node secret with bucket size of 128
		return 1;
	}

	// TODO: Add logic to calculate bucket and add it to bucket group based on LIPS
	public calculateTriedPeerBucketGroup(peerInfo: PeerInfo): number {
		// TODO: Based on IP, IP prefix and hash of random node secret with bucket of 64
		return 1;
	}

	// TODO: Add logic to calculate bucket and add it to bucket group
	public addToNewPeers(peerInfo: PeerInfo): void {
		const bucketGroup = this.calculateNewPeerBucketGroup(peerInfo);
		const bucketId = this._newPeers.get(bucketGroup);

		if (bucketId) {
			bucketId.add(peerInfo);
		} else {
			const setForNewBucket = new Set();
			this._newPeers.set(bucketGroup, setForNewBucket.add(peerInfo));
		}
	}

	// TODO Add logic to calculate bucket and add it to bucket group
	public addToTriedPeers(peerInfo: PeerInfo): void {
		const bucketGroup = this.calculateNewPeerBucketGroup(peerInfo);
		const bucketId = this._triedPeers.get(bucketGroup);

		if (bucketId) {
			bucketId.add(peerInfo);
		} else {
			const setForNewBucket = new Set();
			this._triedPeers.set(bucketGroup, setForNewBucket.add(peerInfo));
		}
	}
}
