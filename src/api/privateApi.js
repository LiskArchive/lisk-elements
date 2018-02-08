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
 *
 */
import * as popsicle from 'popsicle';
import { GET } from 'constants';
import * as utils from './utils';

export function getNodes(): Array<string> {
	if (this.testnet) return this.defaultTestnetNodes;
	if (this.ssl) return this.defaultSSLNodes;
	return this.defaultNodes;
}

export function isBanned(node: string): boolean {
	return this.bannedNodes.includes(node);
}

export function getRandomNode(): string {
	const nodes = getNodes.call(this).filter(node => !isBanned.call(this, node));

	if (!nodes.length) {
		throw new Error(
			'Cannot get random node: all relevant nodes have been banned.',
		);
	}

	const randomIndex = Math.floor(Math.random() * nodes.length);
	return nodes[randomIndex];
}

export function selectNewNode(): string {
	const providedNode = this.options.node;

	if (this.randomNode) {
		return getRandomNode.call(this);
	} else if (providedNode) {
		if (isBanned.call(this, providedNode)) {
			throw new Error(
				'Cannot select node: provided node has been banned and randomNode is not set to true.',
			);
		}
		return providedNode;
	}

	throw new Error(
		'Cannot select node: no node provided and randomNode is not set to true.',
	);
}

export function banActiveNode(): boolean {
	if (!isBanned.call(this, this.node)) {
		this.bannedNodes.push(this.node);
		return true;
	}
	return false;
}

export function hasAvailableNodes(): boolean {
	const nodes = getNodes.call(this);

	return this.randomNode
		? nodes.some(node => !isBanned.call(this, node))
		: false;
}

export function createRequestObject(
	method: string,
	requestType: string,
	providedOptions: Object | Array<Object>,
) {
	const options = providedOptions || {};
	const baseURL = utils.getFullURL(this);
	const url =
		method === GET
			? `${baseURL}/api/${requestType}?${utils.toQueryString(options)}`
			: `${baseURL}/api/${requestType}`;

	return {
		method,
		url,
		headers: this.nethash,
		body: method === GET ? {} : options,
	};
}

export function sendRequestPromise(
	requestMethod: string,
	requestType: string,
	options: Object | Array<Object>,
) {
	const requestObject = createRequestObject.call(
		this,
		requestMethod,
		requestType,
		options,
	);

	return popsicle
		.request(requestObject)
		.use(popsicle.plugins.parse(['json', 'urlencoded']));
}

export function handleTimestampIsInFutureFailures(
	requestMethod: string,
	requestType: string,
	options: any,
	result: Object,
): Promise<*> {
	if (
		!result.success &&
		result.message &&
		result.message.match(/Timestamp is in the future/) &&
		!(options.timeOffset > 40)
	) {
		const newOptions = Object.assign({}, options, {
			timeOffset: (options.timeOffset || 0) + 10,
		});

		return this.sendRequest(requestMethod, requestType, newOptions);
	}
	return Promise.resolve(result);
}

export function handleSendRequestFailures(
	requestMethod: string,
	requestType: string,
	options: Object | Array<Object>,
	error: Error,
): Promise<*> {
	const that = this;
	if (hasAvailableNodes.call(that)) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (that.randomNode) {
					banActiveNode.call(that);
				}
				that.setNode();
				that
					.sendRequest(requestMethod, requestType, options)
					.then(resolve, reject);
			}, 1000);
		});
	}
	return Promise.resolve({
		success: false,
		error,
		message: 'Could not create an HTTP request to any known nodes.',
	});
}
