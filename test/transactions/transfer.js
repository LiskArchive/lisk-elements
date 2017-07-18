if (typeof module !== 'undefined' && module.exports) {
	var slots = require('../../lib/time/slots');
	var common = require('../common');
	var lisk = common.lisk;
}
describe('transfer.js', function () {

	var transfer = lisk.transfer;

	it('should be ok', function () {
		(transfer).should.be.ok();
	});

	it('should be object', function () {
		(transfer).should.be.type('object');
	});

	it('should have properties', function () {
		(transfer).should.have.property('createInTransfer');
	});

	describe('#createInTransfer', function () {

		var createInTransfer = lisk.transfer.createInTransfer;
		var transferTransaction = createInTransfer('secret', 'secondSecret', '1234213');

		it('should be a function', function () {
			(createInTransfer).should.be.type('function');
		});

		it('should create a transfer dapp transaction', function () {
			(transferTransaction).should.be.type('object');
		});

		it('should create a transfer dapp transaction type 6', function () {
			(transferTransaction.type).should.be.equal(6);
		});

		it('should create a transfer dapp transaction with dapp id in asset', function () {
			(transferTransaction.asset.inTransfer.dappId).should.be.equal('1234213');
		});

		it('should create a transfer dapp transaction with first signature', function () {
			(transferTransaction.signature).should.be.ok();
		});

		it('should create a transfer dapp transaction with second signature', function () {
			(transferTransaction.signSignature).should.be.ok();
		});

		it('should create a transfer dapp transaction with just one signature', function () {
			var transferTransactionOneSignature = createInTransfer('secret', '', '1234213');
			(transferTransactionOneSignature.signature).should.be.ok();
			should(transferTransactionOneSignature.secondSignature).be.undefined();
		});

		it('should use time slots to get the time for the timestamp', function () {
			var now = new Date();
			var clock = sinon.useFakeTimers(now, 'Date');
			var time = 36174862;
			var stub = sinon.stub(slots, 'getTime').returns(time);

			var trs = createInTransfer('secret', null, '1234213');

			(trs).should.have.property('timestamp').and.be.equal(time);
			(stub.calledWithExactly(now.getTime())).should.be.true();

			stub.restore();
			clock.restore();
		});

		it('should use time slots with an offset to get the time for the timestamp', function () {
			var now = new Date();
			var clock = sinon.useFakeTimers(now, 'Date');
			var offset = 10e3;
			var time = 36174862;
			var stub = sinon.stub(slots, 'getTime').returns(time);

			var trs = createInTransfer('secret', null, '1234213', offset);

			(trs).should.have.property('timestamp').and.be.equal(time);
			(stub.calledWithExactly(now.getTime() - offset)).should.be.true();

			stub.restore();
			clock.restore();
		});

	});

});
