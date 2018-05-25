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
import createDapp from 'lisk-transactions/5_create_dapp';
// Require is used for stubbing
const time = require('lisk-transactions/utils/time');

describe('#createDapp transaction', () => {
	const fixedPoint = 10 ** 8;
	const transactionType = 5;
	const amount = '0';
	const passphrase = 'secret';
	const secondPassphrase = 'second secret';
	const publicKey =
		'5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09';
	const defaultOptions = {
		category: 0,
		name: 'Lisk Guestbook',
		description: 'The official Lisk guestbook',
		tags: 'guestbook message sidechain',
		type: 0,
		link: 'https://github.com/MaxKK/guestbookDapp/archive/master.zip',
		icon:
			'https://raw.githubusercontent.com/MaxKK/guestbookDapp/master/icon.png',
	};
	const fee = (25 * fixedPoint).toString();
	const timeWithOffset = 38350076;
	const noOptionsError = 'Options must be an object.';
	const categoryIntegerError = 'Dapp category must be an integer.';
	const nameStringError = 'Dapp name must be a string.';
	const typeIntegerError = 'Dapp type must be an integer.';
	const linkStringError = 'Dapp link must be a string.';

	let getTimeWithOffsetStub;
	let options;
	let createDappTransaction;

	beforeEach(() => {
		getTimeWithOffsetStub = sandbox
			.stub(time, 'getTimeWithOffset')
			.returns(timeWithOffset);
		options = Object.assign({}, defaultOptions);
		return Promise.resolve();
	});

	describe('with first passphrase', () => {
		beforeEach(() => {
			createDappTransaction = createDapp({ passphrase, options });
			return Promise.resolve();
		});

		it('should create a create dapp transaction', () => {
			return expect(createDappTransaction).to.be.ok;
		});

		it('should throw an error if no options are provided', () => {
			return expect(createDapp.bind(null, { passphrase })).to.throw(
				noOptionsError,
			);
		});

		it('should throw an error if no category is provided', () => {
			delete options.category;
			return expect(createDapp.bind(null, { passphrase, options })).to.throw(
				categoryIntegerError,
			);
		});

		it('should throw an error if provided category is not an integer', () => {
			options.category = 'not an integer';
			return expect(createDapp.bind(null, { passphrase, options })).to.throw(
				categoryIntegerError,
			);
		});

		it('should throw an error if no name is provided', () => {
			delete options.name;
			return expect(createDapp.bind(null, { passphrase, options })).to.throw(
				nameStringError,
			);
		});

		it('should throw an error if provided name is not a string', () => {
			options.name = 123;
			return expect(createDapp.bind(null, { passphrase, options })).to.throw(
				nameStringError,
			);
		});

		it('should throw an error if no type is provided', () => {
			delete options.type;
			return expect(createDapp.bind(null, { passphrase, options })).to.throw(
				typeIntegerError,
			);
		});

		it('should throw an error if provided type is not an integer', () => {
			options.type = 'not an integer';
			return expect(createDapp.bind(null, { passphrase, options })).to.throw(
				typeIntegerError,
			);
		});

		it('should throw an error if no link is provided', () => {
			delete options.link;
			return expect(createDapp.bind(null, { passphrase, options })).to.throw(
				linkStringError,
			);
		});

		it('should throw an error if provided link is not a string', () => {
			options.link = 123;
			return expect(createDapp.bind(null, { passphrase, options })).to.throw(
				linkStringError,
			);
		});

		it('should not require description, tags, or icon', () => {
			['description', 'tags', 'icon'].forEach(key => delete options[key]);
			return expect(
				createDapp.bind(null, { passphrase, options }),
			).not.to.throw();
		});

		it('should use time.getTimeWithOffset to calculate the timestamp', () => {
			return expect(getTimeWithOffsetStub).to.be.calledWithExactly(undefined);
		});

		it('should use time.getTimeWithOffset with an offset of -10 seconds to calculate the timestamp', () => {
			const offset = -10;
			createDapp({ passphrase, options, timeOffset: offset });

			return expect(getTimeWithOffsetStub).to.be.calledWithExactly(offset);
		});

		describe('returned create dapp transaction', () => {
			it('should be an object', () => {
				return expect(createDappTransaction).to.be.an('object');
			});

			it('should have an id string', () => {
				return expect(createDappTransaction)
					.to.have.property('id')
					.and.be.a('string');
			});

			it('should have type number equal to 5', () => {
				return expect(createDappTransaction)
					.to.have.property('type')
					.and.be.a('number')
					.and.equal(5);
			});

			it('should have amount string equal to 0', () => {
				return expect(createDappTransaction)
					.to.have.property('amount')
					.and.be.a('string')
					.and.equal('0');
			});

			it('should have fee string equal to 25 LSK', () => {
				return expect(createDappTransaction)
					.to.have.property('fee')
					.and.be.a('string')
					.and.equal(fee);
			});

			it('should have recipientId equal to empty string', () => {
				return expect(createDappTransaction)
					.to.have.property('recipientId')
					.and.equal('');
			});

			it('should have senderPublicKey hex string equal to sender public key', () => {
				return expect(createDappTransaction)
					.to.have.property('senderPublicKey')
					.and.be.hexString.and.equal(publicKey);
			});

			it('should have timestamp number equal to result of time.getTimeWithOffset', () => {
				return expect(createDappTransaction)
					.to.have.property('timestamp')
					.and.be.a('number')
					.and.equal(timeWithOffset);
			});

			it('should have signature hex string', () => {
				return expect(createDappTransaction).to.have.property('signature').and
					.be.hexString;
			});

			it('should not have the second signature property', () => {
				return expect(createDappTransaction).not.to.have.property(
					'signSignature',
				);
			});

			it('should have asset', () => {
				return expect(createDappTransaction).to.have.property('asset').and.not
					.be.empty;
			});

			describe('dapps asset', () => {
				it('should be object', () => {
					return expect(createDappTransaction.asset)
						.to.have.property('dapp')
						.and.be.an('object');
				});

				it('should have a category number equal to provided category', () => {
					return expect(createDappTransaction.asset.dapp)
						.to.have.property('category')
						.and.be.a('number')
						.and.equal(options.category);
				});

				it('should have a name string equal to provided name', () => {
					return expect(createDappTransaction.asset.dapp)
						.to.have.property('name')
						.and.be.a('string')
						.and.equal(options.name);
				});

				it('should have a description string equal to provided description', () => {
					return expect(createDappTransaction.asset.dapp)
						.to.have.property('description')
						.and.be.a('string')
						.and.equal(options.description);
				});

				it('should have a tags string equal to provided tags', () => {
					return expect(createDappTransaction.asset.dapp)
						.to.have.property('tags')
						.and.be.a('string')
						.and.equal(options.tags);
				});

				it('should have a type number equal to provided type', () => {
					return expect(createDappTransaction.asset.dapp)
						.to.have.property('type')
						.and.be.a('number')
						.and.equal(options.type);
				});

				it('should have a link string equal to provided link', () => {
					return expect(createDappTransaction.asset.dapp)
						.to.have.property('link')
						.and.be.a('string')
						.and.equal(options.link);
				});

				it('should have an icon string equal to provided icon', () => {
					return expect(createDappTransaction.asset.dapp)
						.to.have.property('icon')
						.and.be.a('string')
						.and.equal(options.icon);
				});
			});
		});
	});

	describe('with first and second passphrase', () => {
		beforeEach(() => {
			createDappTransaction = createDapp({
				passphrase,
				secondPassphrase,
				options,
			});
			return Promise.resolve();
		});

		it('should have the second signature property as hex string', () => {
			return expect(createDappTransaction).to.have.property('signSignature').and
				.be.hexString;
		});
	});

	describe('unsigned create dapp transaction', () => {
		describe('when the create dapp transaction is created without a passphrase', () => {
			beforeEach(() => {
				createDappTransaction = createDapp({
					options,
				});
				return Promise.resolve();
			});

			it('should have the type', () => {
				return expect(createDappTransaction)
					.to.have.property('type')
					.equal(transactionType);
			});

			it('should have the amount', () => {
				return expect(createDappTransaction)
					.to.have.property('amount')
					.equal(amount);
			});

			it('should have the fee', () => {
				return expect(createDappTransaction)
					.to.have.property('fee')
					.equal(fee);
			});

			it('should have the recipient id', () => {
				return expect(createDappTransaction)
					.to.have.property('recipientId')
					.equal('');
			});

			it('should have the sender public key', () => {
				return expect(createDappTransaction)
					.to.have.property('senderPublicKey')
					.equal(null);
			});

			it('should have the timestamp', () => {
				return expect(createDappTransaction).to.have.property('timestamp');
			});

			it('should have the asset with dapp with properties category, description, name, tags, type, link, icon', () => {
				return expect(createDappTransaction)
					.to.have.nested.property('asset.dapp')
					.with.all.keys(
						'category',
						'description',
						'name',
						'tags',
						'type',
						'link',
						'icon',
					);
			});

			it('should not have the signature', () => {
				return expect(createDappTransaction).not.to.have.property('signature');
			});

			it('should not have the id', () => {
				return expect(createDappTransaction).not.to.have.property('id');
			});
		});
	});
});
