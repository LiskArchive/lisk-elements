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

import apiMethod from 'lisk-api-client/api_method';

describe('API method module', () => {
	const GET = 'GET';
	const POST = 'POST';
	const defaultBasePath = 'http://localhost:1234/api';
	const defaultresourcePath = '/resources';
	const defaultFullPath = `${defaultBasePath}${defaultresourcePath}`;
	const defaultHeaders = {
		'Content-Type': 'application/json',
		nethash: 'mainnetHash',
		os: 'lisk-elements-api',
		version: '1.0.0',
		minVersion: '>=0.5.0',
		port: '443',
	};
	const errorArgumentNumber =
		'This endpoint must be supplied with the following parameters: related,id';
	const firstURLParam = 'r-123';
	const secondURLParam = 'id-123';
	let resource;
	let requestResult;
	let handler;
	let validationError;

	beforeEach(() => {
		requestResult = { success: true, sendRequest: true };
		resource = {
			path: defaultresourcePath,
			resourcePath: defaultFullPath,
			headers: defaultHeaders,
			request: sandbox.stub().resolves(requestResult),
			handleRetry: () => {},
		};
		validationError = new Error('No data');
		return Promise.resolve();
	});

	describe('#apiMethod', () => {
		describe('when no parameters are passed', () => {
			beforeEach(() => {
				handler = apiMethod().bind(resource);
				return Promise.resolve();
			});

			it('should return function', () => {
				return expect(handler).to.be.a('function');
			});

			it('should request GET with default URL', () => {
				return handler().then(() => {
					expect(resource.request).to.be.calledOnce;
					return expect(resource.request).to.be.calledWithExactly(
						{
							method: GET,
							url: defaultFullPath,
							headers: defaultHeaders,
						},
						false,
					);
				});
			});
		});

		describe('when initialized with POST / parameters', () => {
			beforeEach(() => {
				handler = apiMethod({
					method: POST,
					path: '/{related}/ids/{id}',
					urlParams: ['related', 'id'],
					validator: data => {
						if (!data.needed) {
							throw validationError;
						}
					},
					defaultData: {
						sort: 'id',
					},
					retry: true,
				}).bind(resource);
				return Promise.resolve();
			});

			it('should return function', () => {
				return expect(handler).to.be.a('function');
			});

			it('should be rejected with error without param', () => {
				return expect(handler()).to.be.rejectedWith(Error, errorArgumentNumber);
			});

			it('should be rejected with error without enough param', () => {
				return expect(handler(firstURLParam)).to.be.rejectedWith(
					Error,
					errorArgumentNumber,
				);
			});

			it('should be rejected with no data', () => {
				return expect(
					handler(firstURLParam, secondURLParam),
				).to.be.rejectedWith(validationError);
			});

			it('should call request with the given data', () => {
				return handler(firstURLParam, secondURLParam, { needed: true }).then(
					() => {
						expect(resource.request).to.be.calledOnce;
						return expect(resource.request).to.be.calledWithExactly(
							{
								method: POST,
								url: `${defaultFullPath}/${firstURLParam}/ids/${
									secondURLParam
								}`,
								headers: defaultHeaders,
								body: {
									needed: true,
									sort: 'id',
								},
							},
							true,
						);
					},
				);
			});
		});

		describe('when initialized with GET / parameters', () => {
			beforeEach(() => {
				handler = apiMethod({
					method: GET,
					path: '/{related}/ids/{id}',
					urlParams: ['related', 'id'],
					validator: data => {
						if (!data.needed) {
							throw validationError;
						}
					},
					defaultData: {
						sort: 'id',
					},
				}).bind(resource);
				return Promise.resolve();
			});

			it('should return a function', () => {
				return expect(handler).to.be.a('function');
			});

			it('should be rejected with error without parameters', () => {
				return expect(handler()).to.be.rejectedWith(Error, errorArgumentNumber);
			});

			it('should be rejected with error without enough parameters', () => {
				return expect(handler(firstURLParam)).to.be.rejectedWith(
					Error,
					errorArgumentNumber,
				);
			});

			it('should be rejected with no data', () => {
				return expect(
					handler(firstURLParam, secondURLParam),
				).to.be.rejectedWith(validationError);
			});

			it('should be request with the given data', () => {
				return handler(firstURLParam, secondURLParam, { needed: true }).then(
					() => {
						expect(resource.request).to.be.calledOnce;
						return expect(resource.request).to.be.calledWithExactly(
							{
								method: GET,
								url: `${defaultFullPath}/${firstURLParam}/ids/${
									secondURLParam
								}?sort=id&needed=true`,
								headers: defaultHeaders,
							},
							false,
						);
					},
				);
			});
		});
	});
});
