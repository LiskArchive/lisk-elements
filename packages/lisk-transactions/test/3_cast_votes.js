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
import castVotes from '../src/3_cast_votes';
// Require is used for stubbing
const time = require('../src/utils/time');

describe('#castVotes transaction', () => {
	const fixedPoint = 10 ** 8;
	const passphrase = 'secret';
	const secondPassphrase = 'second secret';
	const transactionType = 3;
	const firstPublicKey =
		'5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09';
	const secondPublicKey =
		'922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa';
	const thirdPublicKey =
		'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca';
	const fourthPublicKey =
		'd019a4b6fa37e8ebeb64766c7b239d962fb3b3f265b8d3083206097b912cd914';
	const tooShortPublicKey =
		'd019a4b6fa37e8ebeb64766c7b239d962fb3b3f265b8d3083206097b912cd9';
	const plusPrependedPublicKey =
		'+5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09';
	const votePublicKeys = [firstPublicKey, secondPublicKey];
	const unvotePublicKeys = [thirdPublicKey, fourthPublicKey];
	const address = '18160565574430594874L';
	const timeWithOffset = 38350076;
	const amount = '0';
	const fee = (1 * fixedPoint).toString();

	let getTimeWithOffsetStub;
	let castVotesTransaction;

	beforeEach(() => {
		getTimeWithOffsetStub = sandbox
			.stub(time, 'getTimeWithOffset')
			.returns(timeWithOffset);
		return Promise.resolve();
	});

	describe('when the transaction is created with one passphrase and the votes', () => {
		beforeEach(() => {
			castVotesTransaction = castVotes({
				passphrase,
				votes: votePublicKeys,
			});
			return Promise.resolve();
		});

		it('should create a cast votes transaction', () => {
			return expect(castVotesTransaction).to.be.ok;
		});

		it('should use time.getTimeWithOffset to calculate the timestamp', () => {
			return expect(getTimeWithOffsetStub).to.be.calledWithExactly(undefined);
		});

		it('should use time.getTimeWithOffset with an offset of -10 seconds to calculate the timestamp', () => {
			const offset = -10;
			castVotes({ passphrase, votes: votePublicKeys, timeOffset: offset });

			return expect(getTimeWithOffsetStub).to.be.calledWithExactly(offset);
		});

		describe('the returned cast votes transaction', () => {
			it('should be an object', () => {
				return expect(castVotesTransaction).to.be.an('object');
			});

			it('should have id string', () => {
				return expect(castVotesTransaction)
					.to.have.property('id')
					.and.be.a('string');
			});

			it('should have type number equal to 3', () => {
				return expect(castVotesTransaction)
					.to.have.property('type')
					.and.be.a('number')
					.and.equal(transactionType);
			});

			it('should have amount string equal to 0', () => {
				return expect(castVotesTransaction)
					.to.have.property('amount')
					.and.be.a('string')
					.and.equal(amount);
			});

			it('should have fee string equal to 100000000', () => {
				return expect(castVotesTransaction)
					.to.have.property('fee')
					.and.be.a('string')
					.and.equal(fee);
			});

			it('should have recipientId string equal to address', () => {
				return expect(castVotesTransaction)
					.to.have.property('recipientId')
					.and.be.a('string')
					.and.equal(address);
			});

			it('should have senderPublicKey hex string equal to sender public key', () => {
				return expect(castVotesTransaction)
					.to.have.property('senderPublicKey')
					.and.be.hexString.and.equal(firstPublicKey);
			});

			it('should have timestamp number equal to result of time.getTimeWithOffset', () => {
				return expect(castVotesTransaction)
					.to.have.property('timestamp')
					.and.be.a('number')
					.and.equal(timeWithOffset);
			});

			it('should have signature hex string', () => {
				return expect(castVotesTransaction).to.have.property('signature').and.be
					.hexString;
			});

			it('should not have the second signature property', () => {
				return expect(castVotesTransaction).not.to.have.property(
					'signSignature',
				);
			});

			it('should have asset', () => {
				return expect(castVotesTransaction).to.have.property('asset').and.not.be
					.empty;
			});

			describe('votes asset', () => {
				it('should be array', () => {
					return expect(castVotesTransaction.asset)
						.to.have.property('votes')
						.and.be.an('array');
				});

				it('should contain two elements', () => {
					return expect(castVotesTransaction.asset.votes).to.have.length(2);
				});

				it('should have a vote for the delegate public key', () => {
					const expectedArray = [`+${firstPublicKey}`, `+${secondPublicKey}`];
					return expect(castVotesTransaction.asset.votes).to.be.eql(
						expectedArray,
					);
				});
			});
		});
	});

	describe('with first and second passphrase', () => {
		beforeEach(() => {
			castVotesTransaction = castVotes({
				passphrase,
				vote: [firstPublicKey],
				secondPassphrase,
			});
			return Promise.resolve();
		});

		it('should have the second signature property as hex string', () => {
			return expect(castVotesTransaction).to.have.property('signSignature').and
				.be.hexString;
		});
	});

	describe('when the cast vote transaction is created with the votes and unvotes', () => {
		beforeEach(() => {
			castVotesTransaction = castVotes({
				passphrase,
				votes: votePublicKeys,
				unvotes: unvotePublicKeys,
			});
			return Promise.resolve();
		});

		it('the transaction should have the votes as an array', () => {
			return expect(castVotesTransaction.asset)
				.to.have.property('votes')
				.and.be.an('array');
		});

		it('the transaction should have the votes and the unvotes', () => {
			const expectedArray = [
				`+${firstPublicKey}`,
				`+${secondPublicKey}`,
				`-${thirdPublicKey}`,
				`-${fourthPublicKey}`,
			];
			return expect(castVotesTransaction.asset.votes).to.be.eql(expectedArray);
		});
	});

	describe('when the cast vote transaction is created with the unvotes', () => {
		beforeEach(() => {
			castVotesTransaction = castVotes({
				passphrase,
				unvotes: unvotePublicKeys,
			});
			return Promise.resolve();
		});

		it('the transaction should have the votes array', () => {
			return expect(castVotesTransaction.asset)
				.to.have.property('votes')
				.and.be.an('array');
		});

		it('the transaction asset should have the unvotes', () => {
			const expectedArray = [`-${thirdPublicKey}`, `-${fourthPublicKey}`];
			return expect(castVotesTransaction.asset.votes).to.be.eql(expectedArray);
		});
	});

	describe('when the cast vote transaction is created with one too short public key', () => {
		it('should throw an error', () => {
			return expect(
				castVotes.bind(null, {
					passphrase,
					unvotes: unvotePublicKeys,
					votes: [tooShortPublicKey],
				}),
			).to.throw(
				'Public key d019a4b6fa37e8ebeb64766c7b239d962fb3b3f265b8d3083206097b912cd9 length differs from the expected 32 bytes for a public key.',
			);
		});
	});

	describe('when the cast vote transaction is created with one plus prepended public key', () => {
		it('should throw an error', () => {
			return expect(
				castVotes.bind(null, {
					passphrase,
					unvotes: unvotePublicKeys,
					votes: [plusPrependedPublicKey],
				}),
			).to.throw('Argument must be a valid hex string.');
		});
	});

	describe('when the cast vote transaction is created with duplicated public keys', () => {
		describe('Given votes and unvotes with duplication', () => {
			it('should throw a duplication error', () => {
				const votes = [firstPublicKey, secondPublicKey];
				const unvotes = [firstPublicKey, thirdPublicKey];
				return expect(
					castVotes.bind(null, {
						passphrase,
						unvotes,
						votes,
					}),
				).to.throw(
					'Duplicated public key: 5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09.',
				);
			});
		});

		describe('Given votes with duplication', () => {
			it('should throw a duplication error for votes', () => {
				const votes = [firstPublicKey, secondPublicKey, firstPublicKey];
				return expect(
					castVotes.bind(null, {
						passphrase,
						votes,
					}),
				).to.throw(
					'Duplicated public key: 5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09.',
				);
			});
		});

		describe('Given unvotes with duplication', () => {
			it('should throw a duplication error for unvotes', () => {
				const unvotes = [firstPublicKey, secondPublicKey, firstPublicKey];
				return expect(
					castVotes.bind(null, {
						passphrase,
						unvotes,
					}),
				).to.throw(
					'Duplicated public key: 5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09.',
				);
			});
		});
	});

	describe('unsigned cast votes transaction', () => {
		describe('when the cast votes transaction is created without a passphrase', () => {
			beforeEach(() => {
				castVotesTransaction = castVotes({
					votes: votePublicKeys,
					unvotes: unvotePublicKeys,
				});
				return Promise.resolve();
			});

			it('should have the type', () => {
				return expect(castVotesTransaction)
					.to.have.property('type')
					.equal(transactionType);
			});

			it('should have the amount', () => {
				return expect(castVotesTransaction)
					.to.have.property('amount')
					.equal(amount);
			});

			it('should have the fee', () => {
				return expect(castVotesTransaction)
					.to.have.property('fee')
					.equal(fee);
			});

			it('should have the recipient id', () => {
				return expect(castVotesTransaction)
					.to.have.property('recipientId')
					.equal(null);
			});

			it('should have the sender public key', () => {
				return expect(castVotesTransaction)
					.to.have.property('senderPublicKey')
					.equal(null);
			});

			it('should have the timestamp', () => {
				return expect(castVotesTransaction).to.have.property('timestamp');
			});

			it('should have the asset with the votes', () => {
				return expect(castVotesTransaction)
					.to.have.property('asset')
					.with.property('votes');
			});

			it('should not have the signature', () => {
				return expect(castVotesTransaction).not.to.have.property('signature');
			});

			it('should not have the id', () => {
				return expect(castVotesTransaction).not.to.have.property('id');
			});
		});
	});
});
