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
import 'babel-polyfill';
import should from 'should';
import sinon from 'sinon';

process.env.NODE_ENV = 'test';

should.use((_, Assertion) => {
	Assertion.add('hexString', function hexString() {
		this.params = {
			operator: 'to be hex string',
		};
		Buffer.from(this.obj, 'hex').toString('hex').should.equal(this.obj);
	});

	Assertion.add('integer', function integer() {
		this.params = {
			operator: 'to be an integer',
		};
		parseInt(this.obj, 10).should.equal(this.obj);
	});
});

// See https://github.com/shouldjs/should.js/issues/41
Object.defineProperty(global, 'should', { value: should });
global.sinon = sinon;
global.sandbox = sinon.sandbox.create();
