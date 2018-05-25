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

import APIResource from '../src/api_resource';
// Require is used for stubbing
const popsicle = require('popsicle');

describe('API resource module', () => {
	const GET = 'GET';
	const defaultBasePath = 'http://localhost:1234';
	const defaultResourcePath = '/resources';
	const defaultFullPath = `${defaultBasePath}/api${defaultResourcePath}`;
	const defaultHeaders = {
		'Content-Type': 'application/json',
		nethash: 'mainnetHash',
		os: 'lisk-elements-api',
		version: '1.0.0',
		minVersion: '>=0.5.0',
		port: '443',
	};
	const defaultRequest = {
		method: GET,
		url: defaultFullPath,
		headers: defaultHeaders,
	};

	const sendRequestResult = {
		status: 200,
		body: { success: true, sendRequest: true },
	};
	let resource;
	let apiClient;

	beforeEach(() => {
		apiClient = {
			headers: Object.assign({}, defaultHeaders),
			currentNode: defaultBasePath,
			hasAvailableNodes: () => {},
			randomizeNodes: () => {},
			banActiveNodeAndSelect: sandbox.stub(),
		};
		resource = new APIResource(apiClient);
		return Promise.resolve();
	});

	describe('#constructor', () => {
		it('should create an API resource instance', () => {
			return expect(resource).to.be.instanceOf(APIResource);
		});

		it('should throw an error without an input', () => {
			return expect(() => new APIResource()).to.throw(
				'APIResource requires APIClient instance for initialization.',
			);
		});
	});

	describe('get headers', () => {
		it('should return header set to apiClient', () => {
			return expect(resource.headers).to.eql(defaultHeaders);
		});
	});

	describe('get resourcePath', () => {
		it('should return the resource’s full path', () => {
			return expect(resource.resourcePath).to.equal(`${defaultBasePath}/api`);
		});

		it('should return the resource’s full path with set path', () => {
			resource.path = defaultResourcePath;
			return expect(resource.resourcePath).to.equal(
				`${defaultBasePath}/api${defaultResourcePath}`,
			);
		});
	});

	describe('#request', () => {
		let popsicleStub;
		let handleRetryStub;

		beforeEach(() => {
			popsicleStub = sandbox.stub(popsicle, 'request').returns({
				use: () => Promise.resolve(sendRequestResult),
			});
			handleRetryStub = sandbox.stub(resource, 'handleRetry');
			return Promise.resolve();
		});

		it('should make a request to API without calling retry', () => {
			return resource.request(defaultRequest, false).then(res => {
				expect(popsicleStub).to.be.calledOnce;
				expect(handleRetryStub).not.to.be.called;
				return expect(res).to.eql(sendRequestResult.body);
			});
		});

		it('should make a request to API without calling retry when it successes', () => {
			return resource.request(defaultRequest, true).then(res => {
				expect(popsicleStub).to.be.calledOnce;
				expect(handleRetryStub).not.to.be.called;
				return expect(res).to.eql(sendRequestResult.body);
			});
		});

		describe('when response status is greater than 300', () => {
			it('should reject with "An unknown error has occured." message if there is no message is supplied', () => {
				const statusCode = 300;
				popsicleStub.returns({
					use: () =>
						Promise.resolve({
							status: statusCode,
						}),
				});
				return resource.request(defaultRequest, true).catch(err => {
					return expect(err.message).to.equal(
						`Status ${statusCode} : An unknown error has occurred.`,
					);
				});
			});

			it('should reject with error message from server if message is supplied', () => {
				const serverErrorMessage = 'validation error';
				const statusCode = 300;
				popsicleStub.returns({
					use: () =>
						Promise.resolve({
							status: statusCode,
							body: {
								message: serverErrorMessage,
							},
						}),
				});
				return resource.request(defaultRequest, true).catch(err => {
					return expect(err.message).to.eql(
						`Status ${statusCode} : ${serverErrorMessage}`,
					);
				});
			});

			it('should make a request to API with calling retry', () => {
				popsicleStub.returns({
					use: () =>
						Promise.resolve({
							status: 300,
						}),
				});
				return resource.request(defaultRequest, true).catch(() => {
					expect(popsicleStub).to.be.calledOnce;
					return expect(handleRetryStub).to.be.calledOnce;
				});
			});
		});
	});

	describe('#handleRetry', () => {
		let requestStub;
		let defaultError;
		beforeEach(() => {
			defaultError = new Error('could not connect to a node');
			requestStub = sandbox
				.stub(resource, 'request')
				.returns(Promise.resolve(sendRequestResult.body));
			return Promise.resolve();
		});

		describe('when there is available node', () => {
			let clock;

			beforeEach(() => {
				clock = sinon.useFakeTimers();
				apiClient.hasAvailableNodes = () => true;
				return Promise.resolve();
			});

			afterEach(() => {
				return clock.restore();
			});

			it('should call banActiveNode when randomizeNodes is true', () => {
				apiClient.randomizeNodes = true;
				const req = resource.handleRetry(defaultError, defaultRequest, 1);
				clock.tick(1000);
				return req.then(res => {
					expect(apiClient.banActiveNodeAndSelect).to.be.calledOnce;
					expect(requestStub).to.be.calledWith(defaultRequest, true);
					return expect(res).to.be.eql(sendRequestResult.body);
				});
			});

			it('should not call ban active node when randomizeNodes is false', () => {
				apiClient.randomizeNodes = false;
				const req = resource.handleRetry(defaultError, defaultRequest, 1);
				clock.tick(1000);
				return req.then(res => {
					expect(apiClient.banActiveNodeAndSelect).not.to.be.called;
					expect(requestStub).to.be.calledWith(defaultRequest, true);
					return expect(res).to.be.eql(sendRequestResult.body);
				});
			});

			it('should throw an error when randomizeNodes is false and the maximum retry count has been reached', () => {
				apiClient.randomizeNodes = false;
				const req = resource.handleRetry(defaultError, defaultRequest, 4);
				clock.tick(1000);
				return expect(req).to.be.rejectedWith(defaultError);
			});
		});

		describe('when there is no available node', () => {
			beforeEach(() => {
				apiClient.hasAvailableNodes = () => false;
				return Promise.resolve();
			});

			it('should throw an error that is the same as input error', () => {
				const res = resource.handleRetry(defaultError, defaultRequest, 1);
				return expect(res).to.be.rejectedWith(defaultError);
			});
		});
	});
});
