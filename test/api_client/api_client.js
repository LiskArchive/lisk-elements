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
import APIClient from 'api_client/api_client';

describe('APIClient module', () => {
	const mainnetHash =
		'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511';
	const mainnetNodes = [
		'https://node01.lisk.io:443',
		'https://node02.lisk.io:443',
		'https://node03.lisk.io:443',
		'https://node04.lisk.io:443',
		'https://node05.lisk.io:443',
		'https://node06.lisk.io:443',
		'https://node07.lisk.io:443',
		'https://node08.lisk.io:443',
	];
	const testnetHash =
		'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba';
	const testnetNodes = ['http://testnet.lisk.io:7000'];
	const defaultHeaders = {
		'Content-Type': 'application/json',
		nethash: mainnetHash,
		os: 'lisk-elements-api',
		version: '1.0.0',
		minVersion: '>=1.0.0',
	};

	const customHeaders = {
		'Content-Type': 'application/json',
		nethash: testnetHash,
		os: 'lisk-elements-api',
		version: '0.5.0',
		minVersion: '>=0.1.0',
	};

	const localNode = 'http://localhost:7000';
	const externalNode = 'https://googIe.com:8080';
	const sslNode = 'https://external.lisk.io:443';
	const externalTestnetNode = 'http://testnet.lisk.io';
	const defaultNodes = [localNode, externalNode, sslNode];
	const defaultSelectedNode = 'selected_node';

	let apiClient;

	beforeEach(() => {
		apiClient = new APIClient(defaultNodes, mainnetHash);
		return Promise.resolve();
	});

	describe('#constructor', () => {
		let initializeStub;

		beforeEach(() => {
			initializeStub = sandbox.stub(APIClient.prototype, 'initialize');
			return Promise.resolve();
		});

		it('should create a new instance of APIClient', () => {
			return expect(apiClient)
				.to.be.an('object')
				.and.be.instanceof(APIClient);
		});

		it('should call initialize', () => {
			apiClient = new APIClient(defaultNodes, mainnetHash);
			return expect(initializeStub).to.be.calledOnce;
		});
	});

	describe('#createMainnetAPIClient', () => {
		let client;
		beforeEach(() => {
			client = APIClient.createMainnetAPIClient();
			return Promise.resolve();
		});

		it('should return APIClient instance', () => {
			return expect(client).to.be.instanceof(APIClient);
		});

		it('should contain mainnet nodes', () => {
			return expect(client.nodes).to.eql(mainnetNodes);
		});

		it('should be set to mainnet hash', () => {
			return expect(client.headers.nethash).to.equal(mainnetHash);
		});
	});

	describe('#createTestnetAPIClient', () => {
		let client;
		beforeEach(() => {
			client = APIClient.createTestnetAPIClient();
			return Promise.resolve();
		});

		it('should return APIClient instance', () => {
			return expect(client).to.be.instanceof(APIClient);
		});

		it('should contain testnet nodes', () => {
			return expect(client.nodes).to.eql(testnetNodes);
		});

		it('should be set to testnet hash', () => {
			return expect(client.headers.nethash).to.equal(testnetHash);
		});
	});

	describe('#initialize', () => {
		it('should throw an error if no arguments are passed to constructor', () => {
			return expect(apiClient.initialize.bind(apiClient)).to.throw(
				Error,
				'APIClient requires nodes for initialization.',
			);
		});

		it('should throw an error if first argument passed to constructor is not array', () => {
			return expect(apiClient.initialize.bind(apiClient, 'non-array')).to.throw(
				Error,
				'APIClient requires nodes for initialization.',
			);
		});

		it('should throw an error if first argument passed to constructor is empty array', () => {
			return expect(apiClient.initialize.bind(apiClient, [])).to.throw(
				Error,
				'APIClient requires nodes for initialization.',
			);
		});

		it('should throw an error if no second argument is passed to constructor', () => {
			return expect(
				apiClient.initialize.bind(apiClient, defaultNodes),
			).to.throw(Error, 'APIClient requires nethash for initialization.');
		});

		it('should throw an error if second argument passed to constructor is not string', () => {
			return expect(
				apiClient.initialize.bind(apiClient, defaultNodes, 123),
			).to.throw(Error, 'APIClient requires nethash for initialization.');
		});

		it('should throw an error if second argument passed to constructor is empty string', () => {
			return expect(
				apiClient.initialize.bind(apiClient, defaultNodes, ''),
			).to.throw(Error, 'APIClient requires nethash for initialization.');
		});

		describe('headers', () => {
			it('should set with passed nethash, with default options', () => {
				return expect(apiClient)
					.to.have.property('headers')
					.and.eql(defaultHeaders);
			});

			it('should set custom headers with supplied options', () => {
				apiClient = new APIClient(defaultNodes, testnetHash, {
					version: customHeaders.version,
					minVersion: customHeaders.minVersion,
				});
				return expect(apiClient)
					.to.have.property('headers')
					.and.eql(customHeaders);
			});
		});

		describe('nodes', () => {
			it('should have nodes supplied to constructor', () => {
				return expect(apiClient)
					.to.have.property('nodes')
					.and.equal(defaultNodes);
			});
		});

		describe('bannedNodes', () => {
			it('should set empty array if no option is passed', () => {
				return expect(apiClient)
					.to.have.property('bannedNodes')
					.be.eql([]);
			});

			it('should set bannedNodes when passed as an option', () => {
				const bannedNodes = ['a', 'b'];
				apiClient = new APIClient(defaultNodes, mainnetHash, { bannedNodes });
				return expect(apiClient)
					.to.have.property('bannedNodes')
					.be.eql(bannedNodes);
			});
		});

		describe('currentNode', () => {
			it('should set with random node with initialized setup if no node is specified by options', () => {
				return expect(apiClient).to.have.property('currentNode').and.not.be
					.empty;
			});

			it('should set with supplied node if node is specified by options', () => {
				apiClient = new APIClient(defaultNodes, mainnetHash, {
					node: externalTestnetNode,
				});
				return expect(apiClient)
					.to.have.property('currentNode')
					.and.equal(externalTestnetNode);
			});
		});

		describe('randomizeNodes', () => {
			it('should set randomizeNodes to true when randomizeNodes not explicitly set', () => {
				apiClient = new APIClient(defaultNodes, mainnetHash, {
					randomizeNodes: undefined,
				});
				return expect(apiClient).to.have.property('randomizeNodes').be.true;
			});

			it('should set randomizeNodes to true on initialization when passed as an option', () => {
				apiClient = new APIClient(defaultNodes, mainnetHash, {
					randomizeNodes: true,
				});
				return expect(apiClient).to.have.property('randomizeNodes').be.true;
			});

			it('should set randomizeNodes to false on initialization when passed as an option', () => {
				apiClient = new APIClient(defaultNodes, mainnetHash, {
					randomizeNodes: false,
				});
				return expect(apiClient).to.have.property('randomizeNodes').be.false;
			});
		});
	});

	describe('#getNewNode', () => {
		it('should throw an error if all relevant nodes are banned', () => {
			apiClient.bannedNodes = [...defaultNodes];
			return expect(apiClient.getNewNode.bind(apiClient)).to.throw(
				'Cannot get new node: all nodes have been banned.',
			);
		});

		it('should return a node', () => {
			const result = apiClient.getNewNode();
			return expect(defaultNodes).to.contain(result);
		});

		it('should randomly select the node', () => {
			const firstResult = apiClient.getNewNode();
			let nextResult = apiClient.getNewNode();
			// Test will almost certainly time out if not random
			while (nextResult === firstResult) {
				nextResult = apiClient.getNewNode();
			}
			return Promise.resolve();
		});
	});

	describe('#banNode', () => {
		it('should add node to banned nodes', () => {
			const banned = apiClient.banNode(localNode);
			expect(banned).to.be.true;
			return expect(apiClient.isBanned(localNode)).to.be.true;
		});

		it('should not duplicate a banned node', () => {
			const bannedNodes = [localNode];
			apiClient.bannedNodes = bannedNodes;
			const banned = apiClient.banNode(localNode);

			expect(banned).to.be.false;
			return expect(apiClient.bannedNodes).to.be.eql(bannedNodes);
		});
	});

	describe('#banActiveNode', () => {
		let currentNode;

		beforeEach(() => {
			({ currentNode } = apiClient);
			return Promise.resolve();
		});

		it('should add current node to banned nodes', () => {
			const banned = apiClient.banActiveNode();
			expect(banned).to.be.true;
			return expect(apiClient.isBanned(currentNode)).to.be.true;
		});

		it('should not duplicate a banned node', () => {
			const bannedNodes = [currentNode];
			apiClient.bannedNodes = bannedNodes;
			const banned = apiClient.banActiveNode();

			expect(banned).to.be.false;
			return expect(apiClient.bannedNodes).to.be.eql(bannedNodes);
		});
	});

	describe('#banActiveNodeAndSelect', () => {
		let currentNode;
		let getNewNodeStub;

		beforeEach(() => {
			({ currentNode } = apiClient);
			getNewNodeStub = sandbox
				.stub(apiClient, 'getNewNode')
				.returns(defaultSelectedNode);
			return Promise.resolve();
		});

		it('should call ban current node', () => {
			apiClient.banActiveNodeAndSelect();
			return expect(apiClient.isBanned(currentNode)).to.be.true;
		});

		it('should call selectNewNode when the node is banned', () => {
			apiClient.banActiveNodeAndSelect();
			return expect(getNewNodeStub).to.be.calledOnce;
		});

		it('should not call selectNewNode when the node is not banned', () => {
			const bannedNodes = [currentNode];
			apiClient.bannedNodes = bannedNodes;
			apiClient.banActiveNodeAndSelect();
			return expect(getNewNodeStub).not.to.be.called;
		});
	});

	describe('#isBanned', () => {
		it('should return true when provided node is banned', () => {
			apiClient.bannedNodes.push(localNode);
			return expect(apiClient.isBanned(localNode)).to.be.true;
		});

		it('should return false when provided node is not banned', () => {
			return expect(apiClient.isBanned(localNode)).to.be.false;
		});
	});

	describe('#hasAvailableNodes', () => {
		it('should return false without nodes left', () => {
			apiClient.bannedNodes = [...defaultNodes];
			const result = apiClient.hasAvailableNodes();
			return expect(result).to.be.false;
		});

		it('should return true if nodes are available', () => {
			const result = apiClient.hasAvailableNodes();
			return expect(result).to.be.true;
		});
	});
});
