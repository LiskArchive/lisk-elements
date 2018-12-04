import addresses from '../fixtures/addresses.json';
import { expect } from 'chai';
import transactionsObjects from '../fixtures/transactions.json';
import { wrapTransferTransaction } from './utils/add_transaction_functions';
import { TransactionPool, Transaction } from '../src/transaction_pool';
import * as sinon from 'sinon';
// Require is used for stubbing
const Queue = require('../src/queue').Queue;
const queueCheckers = require('../src/queue_checkers');

describe('transaction pool', () => {
	const EXPIRE_TRANSACTIONS_JOB = 86400;
	const MAX_TRANSACTIONS_PER_QUEUE = 1000;
	const transactions = transactionsObjects.map(wrapTransferTransaction);
	let transactionPool: TransactionPool;

	let checkerStubs: {
		[key: string]: sinon.SinonStub;
	};

	beforeEach('add transactions in the transaction pool', () => {
		checkerStubs = {
			checkTransactionPropertyForValues: sandbox.stub(
				queueCheckers,
				'checkTransactionPropertyForValues',
			),
			checkTransactionForSenderPublicKey: sandbox.stub(
				queueCheckers,
				'checkTransactionForSenderPublicKey',
			),
			checkTransactionForId: sandbox.stub(
				queueCheckers,
				'checkTransactionForId',
			),
			checkTransactionForRecipientId: sandbox.stub(
				queueCheckers,
				'checkTransactionForRecipientId',
			),
			checkTransactionForExpiry: sandbox.stub(
				queueCheckers,
				'checkTransactionForExpiry',
			),
		};

		transactionPool = new TransactionPool({
			EXPIRE_TRANSACTIONS_JOB,
			MAX_TRANSACTIONS_PER_QUEUE,
		});
		Object.keys(transactionPool.queues).forEach(queueName => {
			sandbox
				.stub((transactionPool as any)._queues, queueName)
				.value(sinon.createStubInstance(Queue));
		});
	});

	afterEach(() => {
		return sandbox.restore();
	});

	describe('#addTransaction', () => {
		let existsInPoolStub: sinon.SinonStub;
		let isFullStub: sinon.SinonStub;

		beforeEach(() => {
			existsInPoolStub = sandbox.stub(
				transactionPool,
				'existsInTransactionPool',
			);
			isFullStub = transactionPool.queues.received.size as sinon.SinonStub;
			return;
		});

		it('should return true for alreadyExists if transaction already exists in pool', () => {
			existsInPoolStub.returns(true);
			return expect(transactionPool.addTransaction(transactions[0]).alreadyExists).to
				.be.true;
		});

		it('should return false for alreadyExists if transaction does not exist in pool', () => {
			existsInPoolStub.returns(false);
			return expect(transactionPool.addTransaction(transactions[0]).alreadyExists).to
				.be.false;
		});

		it('should return false for isFull if queue.size is less than MAX_TRANSACTIONS_PER_QUEUE', () => {
			existsInPoolStub.returns(false);
			isFullStub.returns(MAX_TRANSACTIONS_PER_QUEUE - 1);
			return expect(transactionPool.addTransaction(transactions[0]).isFull).to.be
				.false;
		});

		it('should return true for isFull if queue.size is equal to or greater than MAX_TRANSACTIONS_PER_QUEUE', () => {
			existsInPoolStub.returns(false);
			isFullStub.returns(MAX_TRANSACTIONS_PER_QUEUE);
			return expect(transactionPool.addTransaction(transactions[0]).isFull).to.be.true;
		});

		it('should call enqueue for received queue if the transaction does not exist and queue is not full', () => {
			existsInPoolStub.returns(false);
			isFullStub.returns(MAX_TRANSACTIONS_PER_QUEUE - 1);
			transactionPool.addTransaction(transactions[0]);
			return expect(transactionPool.queues.received
				.enqueueOne as sinon.SinonStub).to.be.calledWith(transactions[0]);
		});

		it('should return false for isFull and alreadyExists if the transaction does not exist and queue is not full', () => {
			existsInPoolStub.returns(false);
			isFullStub.returns(MAX_TRANSACTIONS_PER_QUEUE - 1);
			const addedTransactionStatus = transactionPool.addTransaction(
				transactions[0],
			);
			expect(addedTransactionStatus.isFull).to.be.false;
			return expect(addedTransactionStatus.alreadyExists).to.be.false;
		});
	});

	describe('#addVerifiedTransaction', () => {
		let existsInPoolStub: sinon.SinonStub;
		let isFullStub: sinon.SinonStub;

		beforeEach(() => {
			existsInPoolStub = sandbox.stub(
				transactionPool,
				'existsInTransactionPool',
			);
			isFullStub = transactionPool.queues.verified.size as sinon.SinonStub;
			return;
		});

		it('should return true for alreadyExists if transaction already exists in pool', () => {
			existsInPoolStub.returns(true);
			return expect(transactionPool.addVerifiedTransaction(transactions[0]).alreadyExists).to
				.be.true;
		});

		it('should return false for alreadyExists if transaction does not exist in pool', () => {
			existsInPoolStub.returns(false);
			return expect(transactionPool.addVerifiedTransaction(transactions[0]).alreadyExists).to
				.be.false;
		});

		it('should return false for isFull if queue.size is less than MAX_TRANSACTIONS_PER_QUEUE', () => {
			existsInPoolStub.returns(false);
			isFullStub.returns(MAX_TRANSACTIONS_PER_QUEUE - 1);
			return expect(transactionPool.addVerifiedTransaction(transactions[0]).isFull).to.be
				.false;
		});

		it('should return true for isFull if queue.size is equal to or greater than MAX_TRANSACTIONS_PER_QUEUE', () => {
			existsInPoolStub.returns(false);
			isFullStub.returns(MAX_TRANSACTIONS_PER_QUEUE);
			return expect(transactionPool.addVerifiedTransaction(transactions[0]).isFull).to.be.true;
		});

		it('should call enqueue for received queue if the transaction does not exist and queue is not full', () => {
			existsInPoolStub.returns(false);
			isFullStub.returns(MAX_TRANSACTIONS_PER_QUEUE - 1);
			transactionPool.addVerifiedTransaction(transactions[0]);
			return expect(transactionPool.queues.verified
				.enqueueOne as sinon.SinonStub).to.be.calledWith(transactions[0]);
		});

		it('should return false for isFull and alreadyExists if the transaction does not exist and queue is not full', () => {
			existsInPoolStub.returns(false);
			isFullStub.returns(MAX_TRANSACTIONS_PER_QUEUE - 1);
			const addedTransactionStatus = transactionPool.addVerifiedTransaction(
				transactions[0],
			);
			expect(addedTransactionStatus.isFull).to.be.false;
			return expect(addedTransactionStatus.alreadyExists).to.be.false;
		});
	});


	describe('getProcessableTransactions', () => {});
	describe('onDeleteBlock', () => {
		const block = {
			transactions: [transactions[0], transactions[1], transactions[2]],
		};

		it('should call checkTransactionForRecipientId with block transactions', () => {
			transactionPool.onDeleteBlock(block);
			expect(
				checkerStubs.checkTransactionForRecipientId,
			).to.be.calledWithExactly(block.transactions);
		});

		it('should call removeFor for verified, pending and ready queues once', () => {
			transactionPool.onDeleteBlock(block);
			const { pending, verified, ready } = transactionPool.queues;
			expect(pending.removeFor).to.be.calledOnce;
			expect(verified.removeFor).to.be.calledOnce;
			expect(ready.removeFor).to.be.calledOnce;
		});

		it('should call enqueueMany for verified queue with transactions from the deleted block', () => {
			transactionPool.onDeleteBlock(block);
			expect(transactionPool.queues.verified.enqueueMany).to.be.calledWith(
				block.transactions,
			);
		});

		it('should call enqueueMany for validated queue with transactions removed from other queues', () => {
			const { received, validated, ...otherQueues } = transactionPool.queues;
			const removedTransactions = Object.keys(otherQueues)
				.map(queueName => {
					const removedTransactions = [transactions[0]];
					(transactionPool.queues[queueName]
						.removeFor as sinon.SinonStub).returns(removedTransactions);
					return removedTransactions;
				})
				.reduce((acc, value) => acc.concat(value), []);
			transactionPool.onDeleteBlock(block);
			expect(transactionPool.queues.validated.enqueueMany).to.be.calledWith(
				removedTransactions,
			);
		});
	});

	describe('onNewBlock', () => {
		const block = {
			transactions: [transactions[0], transactions[1], transactions[2]],
		};

		it('should call checkTransactionForId with block transactions', () => {
			transactionPool.onNewBlock(block);
			expect(checkerStubs.checkTransactionForId).to.be.calledWithExactly(
				block.transactions,
			);
		});

		it('should call checkTransactionForSenderPublicKey with block transactions', () => {
			transactionPool.onNewBlock(block);
			expect(
				checkerStubs.checkTransactionForSenderPublicKey,
			).to.be.calledWithExactly(block.transactions);
		});

		it('should call removeFor for received and validated queues once', () => {
			transactionPool.onNewBlock(block);
			const { received, validated } = transactionPool.queues;
			expect(received.removeFor).to.be.calledOnce;
			expect(validated.removeFor).to.be.calledOnce;
		});

		it('should call removeFor for pending, verified and ready queues thrice', () => {
			transactionPool.onNewBlock(block);
			const { pending, verified, ready } = transactionPool.queues;
			expect(pending.removeFor).to.be.calledThrice;
			expect(verified.removeFor).to.be.calledThrice;
			expect(ready.removeFor).to.be.calledThrice;
		});

		it('should call enqueueMany for validated queue with transactions removed from other queues', () => {
			const { received, validated, ...otherQueues } = transactionPool.queues;
			const removedTransactions = Object.keys(otherQueues)
				.map(queueName => {
					const removedTransactions = [transactions[0]];
					(transactionPool.queues[queueName]
						.removeFor as sinon.SinonStub).returns(removedTransactions);
					return removedTransactions;
				})
				.reduce((acc, value) => acc.concat(value), []);
			transactionPool.onNewBlock(block);
			expect(transactionPool.queues.validated.enqueueMany).to.be.calledWith([
				...removedTransactions,
				...removedTransactions,
			]);
		});
	});

	describe('onRoundRollback', () => {
		const roundDelegateAddresses = addresses;

		it('should call checkTransactionForProperty with block sender addresses and "senderPublicKey" property', () => {
			transactionPool.onRoundRollback(roundDelegateAddresses);
			const senderProperty = 'senderPublicKey';
			expect(
				checkerStubs.checkTransactionPropertyForValues.calledWithExactly(
					roundDelegateAddresses,
					senderProperty,
				),
			).to.equal(true);
		});

		it('should call removeFor for pending, verified and ready queues once', () => {
			transactionPool.onRoundRollback(roundDelegateAddresses);
			const { pending, verified, ready } = transactionPool.queues;
			expect(pending.removeFor).to.be.calledOnce;
			expect(verified.removeFor).to.be.calledOnce;
			expect(ready.removeFor).to.be.calledOnce;
		});

		it('should call enqueueMany for validated queue with transactions removed from other queues', () => {
			const { received, validated, ...otherQueues } = transactionPool.queues;
			const removedTransactions = Object.keys(otherQueues)
				.map(queueName => {
					const removedTransactions = [transactions[0]];
					(transactionPool.queues[queueName]
						.removeFor as sinon.SinonStub).returns(removedTransactions);
					return removedTransactions;
				})
				.reduce((acc, value) => acc.concat(value), []);
			transactionPool.onRoundRollback(roundDelegateAddresses);
			expect(transactionPool.queues.validated.enqueueMany).to.be.calledWith(
				removedTransactions,
			);
		});
	});

	describe('#expireTransactions', () => {
		let removeTransactionsFromQueuesStub: sinon.SinonStub;
		let expireTransactions: () => Promise<ReadonlyArray<Transaction>>;

		beforeEach(() => {
			removeTransactionsFromQueuesStub = sandbox.stub(
				transactionPool as any,
				'removeTransactionsFromQueues',
			);
			return (expireTransactions = (transactionPool as any)[
				'expireTransactions'
			].bind(transactionPool));
		});

		it('should call removeTransactionsFromQueues once', () => {
			return expireTransactions().then(
				() => expect(removeTransactionsFromQueuesStub).to.be.calledOnce,
			);
		});
	});
});
