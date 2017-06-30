if (typeof module !== 'undefined' && module.exports) {
	var common = require('../common');
	var lisk = common.lisk;
	var privateApi = common.privateApi;
	var utils = common.utils;
	var sinon = common.sinon;
	process.env.NODE_ENV = 'test';
}

describe('Lisk.api()', function () {

	var LSK = lisk.api();

	describe('lisk.api()', function () {

		it('should create a new instance when using lisk.api()', function () {
			(LSK).should.be.ok();
		});

		it('new lisk.api() should be Object', function () {
			(LSK).should.be.type('object');
		});

		it('should use testnet peer for testnet settings', function () {
			var TESTLSK = lisk.api({ testnet: true });

			(TESTLSK.port).should.be.equal(7000);
			(TESTLSK.testnet).should.be.equal(true);
		});

	});

	describe('#listPeers', function () {
		it('should give a set of the peers', function () {
			(LSK.listPeers()).should.be.ok;
			(LSK.listPeers()).should.be.type.Object;
			(LSK.listPeers().official.length).should.be.equal(8);
			(LSK.listPeers().testnet.length).should.be.equal(1);
		});
	});

	describe('.currentPeer', function () {

		it('currentPeer should be set by default', function () {
			(LSK.currentPeer).should.be.ok;
		});
	});

	describe('#getNethash', function () {

		it('Nethash should be hardcoded variables', function () {
			var NetHash = {
				'Content-Type': 'application/json',
				'nethash': 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511',
				'broadhash': 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511',
				'os': 'lisk-js-api',
				'version': '1.0.0',
				'minVersion': '>=0.5.0',
				'port': 8000
			};
			(LSK.getNethash()).should.eql(NetHash);
		});

		it('should give corret Nethash for testnet', function () {
			LSK.setTestnet(true);

			var NetHash = {
				'Content-Type': 'application/json',
				'nethash': 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba',
				'broadhash': 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba',
				'os': 'lisk-js-api',
				'version': '1.0.0',
				'minVersion': '>=0.5.0',
				'port': 7000
			};

			(LSK.getNethash()).should.eql(NetHash);
		});


		it('should be possible to use my own Nethash', function () {
			var NetHash = {
				'Content-Type': 'application/json',
				'nethash': '123',
				'broadhash': 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511',
				'os': 'lisk-js-api',
				'version': '0.0.0a',
				'minVersion': '>=0.5.0',
				'port': 8000
			};
			var LSKNethash = lisk.api({ nethash: '123' });

			(LSKNethash.nethash).should.eql(NetHash);
		});
	});

	describe('#setTestnet', function () {

		it('should set to testnet', function () {
			var LISK = lisk.api();
			LISK.setTestnet(true);

			(LISK.testnet).should.be.true;
		});

		it('should set to mainnet', function () {
			var LISK = lisk.api();
			LISK.setTestnet(false);

			(LISK.testnet).should.be.false;
		});
	});

	describe('#setNode', function () {

		it('should be able to set my own node', function () {
			var myOwnNode = 'myOwnNode.com';
			LSK.setNode(myOwnNode);

			(LSK.currentPeer).should.be.equal(myOwnNode);
		});

		it('should select a node when not explicitly set', function () {
			LSK.setNode();

			(LSK.currentPeer).should.be.ok();
		});
	});

	describe('#selectNode', function () {

		it('should return the node from initial settings when set', function () {
			var LiskUrlInit = lisk.api({ port: 7000, node: 'localhost', ssl: true, randomPeer: false });

			(privateApi.selectNode.call(LiskUrlInit)).should.be.equal('localhost');
		});
	});

	describe('#getRandomPeer', function () {
		var LiskUrlInit = lisk.api({ port: 7000, node: 'localhost', ssl: true, randomPeer: false });
		it('should give a random peer', function () {
			(privateApi.getRandomPeer.call(LiskUrlInit)).should.be.ok();
		});
	});

	describe('#banNode', function () {

		it('should add current node to LSK.bannedPeers', function () {
			var currentNode = LSK.currentPeer;
			privateApi.banNode.call(LSK);

			(LSK.bannedPeers).should.containEql(currentNode);
		});
	});

	describe('#getFullUrl', function () {

		it('should give the full url inclusive port', function () {
			var LiskUrlInit = lisk.api({ port: 7000, node: 'localhost', ssl: false });
			var fullUrl = 'http://localhost:7000';

			(privateApi.getFullUrl.call(LiskUrlInit)).should.be.equal(fullUrl);
		});

		it('should give the full url without port and with SSL', function () {
			var LiskUrlInit = lisk.api({ port: '', node: 'localhost', ssl: true });
			var fullUrl = 'https://localhost';

			(privateApi.getFullUrl.call(LiskUrlInit)).should.be.equal(fullUrl);
		});
	});

	describe('#getURLPrefix', function () {

		it('should be http when ssl is false', function () {
			LSK.setSSL(false);

			(privateApi.getURLPrefix.call(LSK)).should.be.equal('http');
		});

		it('should be https when ssl is true', function () {
			LSK.setSSL(true);

			(privateApi.getURLPrefix.call(LSK)).should.be.equal('https');
		});
	});

	describe('#trimObj', function () {

		var untrimmedObj = {
			' my_Obj ': ' myval '
		};

		var trimmedObj = {
			'my_Obj': 'myval'
		};

		it('should not be equal before trim', function () {
			(untrimmedObj).should.not.be.equal(trimmedObj);
		});

		it('should be equal after trim an Object in keys and value', function () {
			var trimIt = utils.trimObj(untrimmedObj);

			(trimIt).should.be.eql(trimmedObj);
		});

		it('should accept numbers and strings as value', function () {
			var obj = {
				'myObj': 2
			};

			var trimmedObj = utils.trimObj(obj);
			(trimmedObj).should.be.ok;
			(trimmedObj).should.be.eql({ myObj: '2' });
		});

		it('should accept numbers and strings as value', function () {
			var obj = '123';

			var trimmedObj = utils.trimObj(obj);
			(trimmedObj).should.be.ok;
			(trimmedObj).should.be.equal('123');
		});

		it('should accept numbers and strings as value', function () {
			var obj = {
				'account': {
					12: 12
				}
			};

			var trimmedObj = utils.trimObj(obj);
			(trimmedObj).should.be.ok;
			(trimmedObj).should.be.eql({ 'account': { '12': '12' } });
		});

		it('should accept an array as initial value', function () {
			var obj = [
				{
					'account': {
						12: 12
					}
				}
			];

			var trimmedObj = utils.trimObj(obj);
			(trimmedObj).should.be.ok;
			(trimmedObj).should.be.eql([{ 'account': { '12': '12' } }]);
		});
	});

	describe('#toQueryString', function () {

		it('should create a http string from an object. Like { obj: "myval", key: "myval" } -> obj=myval&key=myval', function () {
			var myObj = {
				obj: 'myval',
				key: 'my2ndval'
			};

			var serialised = utils.toQueryString(myObj);

			(serialised).should.be.equal('obj=myval&key=my2ndval');
		});
	});

	describe('#serialiseHttpData', function () {

		it('should create a http string from an object and trim.', function () {
			var myObj = {
				obj: ' myval',
				key: 'my2ndval '
			};

			var serialised = privateApi.serialiseHttpData(myObj);

			(serialised).should.be.equal('?obj=myval&key=my2ndval');
		});
	});

	describe('#getAddressFromSecret', function () {

		it('should create correct address and publicKey', function () {
			var address = {
				publicKey: 'a4465fd76c16fcc458448076372abf1912cc5b150663a64dffefe550f96feadd',
				address: '12475940823804898745L'
			};

			(LSK.getAddressFromSecret('123')).should.eql(address);
		});
	});

	describe('#checkOptions', function () {

		it('should not accept falsy options like undefined', function (done) {
			try {
				lisk.api().sendRequest('delegates/', {limit:undefined}, function () {});
			} catch (e) {
				(e.message).should.be.equal('parameter value "limit" should not be undefined');
				done();
			}
		});

		it('should not accept falsy options like NaN', function (done) {
			try {
				lisk.api().sendRequest('delegates/', {limit:NaN}, function () {});
			} catch (e) {
				(e.message).should.be.equal('parameter value "limit" should not be NaN');
				done();
			}
		});

	});

	describe('#sendRequest', function () {
		var expectedResponse = {
			body: { success: true, height: 2850466 },
		};

		it('should receive Height from a random public peer', function (done) {
			sinon.stub(privateApi, 'sendRequestPromise').resolves(expectedResponse);
			LSK.sendRequest('blocks/getHeight', function (data) {
				(data).should.be.ok;
				(data).should.be.type('object');
				(data.success).should.be.true();

				privateApi.sendRequestPromise.restore();
				done();
			});
		});
	});

	describe('#listActiveDelegates', function () {
		var expectedResponse = {
			body: {
				success: true,
				delegates: [{
					username: 'thepool',
					address: '10839494368003872009L',
					publicKey: 'b002f58531c074c7190714523eec08c48db8c7cfc0c943097db1a2e82ed87f84',
					vote: '2315391211431974',
					producedblocks: 13340,
					missedblocks: 373,
					rate: 1,
					rank: 1,
					approval: 21.64,
					productivity: 97.28,
				}],
			},
		};

		it('should list active delegates', function () {
			var callback = sinon.spy();
			var options = { limit: '1' };
			sinon.stub(LSK, 'sendRequest').callsArgWith(2, expectedResponse);

			LSK.listActiveDelegates('1', callback);

			(LSK.sendRequest.calledWith('delegates/', options)).should.be.true();
			(callback.called).should.be.true();
			(callback.calledWith(expectedResponse)).should.be.true();
			LSK.sendRequest.restore();
		});
	});

	describe('#listStandbyDelegates', function () {
		var expectedResponse = {
			body: {
				success: true,
				delegates: [{
					username: 'bangomatic',
					address: '15360265865206254368L',
					publicKey: 'f54ce2a222ab3513c49e586464d89a2a7d9959ecce60729289ec0bb6106bd4ce',
					vote: '1036631485530636',
					producedblocks: 12218,
					missedblocks: 139,
					rate: 102,
					rank: 102,
					approval: 9.69,
					productivity: 0,
				}],
			},
		};

		it('should list standby delegates', function () {
			var callback = sinon.spy();
			var options =  { limit: '1', sort: 'rate:asc', offset: 101 };
			sinon.stub(LSK, 'sendRequest').callsArgWith(2, expectedResponse);

			LSK.listStandbyDelegates('1', callback);

			(LSK.sendRequest.calledWith('delegates/', options)).should.be.true();
			(callback.called).should.be.true();
			(callback.calledWith(expectedResponse)).should.be.true();
			LSK.sendRequest.restore();
		});
	});

	describe('#searchDelegateByUsername', function () {
		var expectedResponse = {
			body: {
				success: true,
				delegates: [{
					username: 'oliver',
					address: '10872755118372042973L',
					publicKey: 'ac2e6931e5df386f3b8d278f9c14b6396ea6f2d8c6aab6e3bc9b857b3e136877',
					vote: '22499233987816',
					producedblocks: 0,
					missedblocks: 0,
				}],
			},
		};

		it('should find a delegate by name', function () {
			var callback = sinon.spy();
			var options = { username: 'oliver' };
			sinon.stub(LSK, 'sendRequest').callsArgWith(2, expectedResponse);

			LSK.searchDelegateByUsername('oliver', callback);

			(LSK.sendRequest.calledWith('delegates/', options)).should.be.true();
			(callback.called).should.be.true();
			(callback.calledWith(expectedResponse)).should.be.true();
			LSK.sendRequest.restore();
		});
	});

	describe('#listBlocks', function () {
		var expectedResponse = {
			body: {
				success: true,
				blocks: [{
					id: '7650813318077105965',
					version: 0,
					timestamp: 30745470,
					height: 2852547,
					previousBlock: '15871436233132203555',
					numberOfTransactions: 0,
					totalAmount: 0,
					totalFee: 0,
					reward: 500000000,
					payloadLength: 0,
					payloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
					generatorPublicKey: 'b3953cb16e2457b9be78ad8c8a2985435dedaed5f0dd63443bdfbccc92d09f2d',
					generatorId: '6356913781456505636L',
					blockSignature: '2156b5b20bd338fd1d575ddd8550fd5675e80eec70086c31e60e797e30efdeede8075f7ac35db3f0c45fed787d1ffd7368a28a2642ace7ae529eb538a0a90705',
					confirmations: 1,
					totalForged: '500000000',
				}],
			},
		};

		it('should list amount of blocks defined', function () {
			var callback = sinon.spy();
			var options = { limit: '1'};
			sinon.stub(LSK, 'sendRequest').callsArgWith(2, expectedResponse);

			LSK.listBlocks('1', callback);

			(LSK.sendRequest.calledWith('blocks', options)).should.be.true();
			(callback.called).should.be.true();
			(callback.calledWith(expectedResponse)).should.be.true();
			LSK.sendRequest.restore();
		});
	});

	describe('#listForgedBlocks', function () {
		var expectedResponse = {
			body: {
				success: true
			}
		};

		it('should list amount of ForgedBlocks', function () {
			var callback = sinon.spy();
			var key = '130649e3d8d34eb59197c00bcf6f199bc4ec06ba0968f1d473b010384569e7f0';
			var options = { generatorPublicKey: key};
			sinon.stub(LSK, 'sendRequest').callsArgWith(2, expectedResponse);

			LSK.listForgedBlocks(key, callback);

			(LSK.sendRequest.calledWith('blocks', options)).should.be.true();
			(callback.called).should.be.true();
			(callback.calledWith(expectedResponse)).should.be.true();
			LSK.sendRequest.restore();
		});
	});

	describe('#getBlock', function () {
		var expectedResponse = {
			body: {
				success: true,
				blocks: [{
					id: '5834892157785484325',
					version: 0,
					timestamp: 25656190,
					height: 2346638,
					previousBlock: '10341689082372310738',
					numberOfTransactions: 0,
					totalAmount: 0,
					totalFee: 0,
					reward: 500000000,
					payloadLength: 0,
					payloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
					generatorPublicKey: '2cb967f6c73d9b6b8604d7b199271fed3183ff18ae0bd9cde6d6ef6072f83c05',
					generatorId: '9540619224043865035L',
					blockSignature: '0c0554e28adeeed7f1071cc5cba76b77340e0f406757e7a9e7ab80b1711856089ec743dd4954c2db10ca6e5e2dab79d48d15f7b5a08e59c29d622a1a20e1fd0d',
					confirmations: 506049,
					totalForged: '500000000',
				}],
				count: 1,
			},
		};

		it('should get a block of certain height', function () {
			var callback = sinon.spy();
			var blockId = '2346638';
			var options = { height: blockId};
			sinon.stub(LSK, 'sendRequest').callsArgWith(2, expectedResponse);

			LSK.getBlock(blockId, callback);

			(LSK.sendRequest.calledWith('blocks', options)).should.be.true();
			(callback.called).should.be.true();
			(callback.calledWith(expectedResponse)).should.be.true();
			LSK.sendRequest.restore();
		});
	});

	describe('#listTransactions', function () {
		var expectedResponse = {
			body: {
				success: true,
				transactions: [{
					id: '16951900355716521650',
					height: 2845738,
					blockId: '10920144534340154099',
					type: 0,
					timestamp: 30676572,
					senderPublicKey: '2cb967f6c73d9b6b8604d7b199271fed3183ff18ae0bd9cde6d6ef6072f83c05',
					senderId: '9540619224043865035L',
					recipientId: '12731041415715717263L',
					recipientPublicKey: 'a81d59b68ba8942d60c74d10bc6488adec2ae1fa9b564a22447289076fe7b1e4',
					amount: 146537207,
					fee: 10000000,
					signature: 'b5b6aa065db4c47d2fa5b0d8568138460640216732e3926fdd7eff79f3f183e93ffe38f0e33a1b70c97d4dc9efbe61da55e94ab24ca34e134e71e94fa1b6f108',
					signatures: [],
					confirmations: 7406,
					asset: {},
				}],
				count: '120',
			},
		};


		it('should list transactions of a defined account', function () {
			var callback = sinon.spy();
			var address = '12731041415715717263L';
			var options = {
				senderId: address,
				recipientId: address,
				limit: '1',
				offset: '2',
				sort: 'timestamp:desc'
			};
			sinon.stub(LSK, 'sendRequest').callsArgWith(2, expectedResponse);

			LSK.listTransactions(address, '1', '2', callback);

			(LSK.sendRequest.calledWith('transactions', options)).should.be.true();
			(callback.called).should.be.true();
			(callback.calledWith(expectedResponse)).should.be.true();
			LSK.sendRequest.restore();
		});

	});

	describe('#getTransaction', function () {
		var expectedResponse = {
			body: {
				success: true,
				transaction: {
					id: '7520138931049441691',
					height: 2346486,
					blockId: '11556561638256817055',
					type: 0,
					timestamp: 25654653,
					senderPublicKey: '632763673e5b3a0b704cd723d8c5bdf0be47e08210fe56a0c530f27ced6c228e',
					senderId: '1891806528760779417L',
					recipientId: '1813095620424213569L',
					recipientPublicKey: 'e01b6b8a9b808ec3f67a638a2d3fa0fe1a9439b91dbdde92e2839c3327bd4589',
					amount: 56340416586,
					fee: 10000000,
					signature: 'd04dc857e718af56ae3cff738ba22dce7da0118565675527ddf61d154cfea70afd11db1e51d6d9cce87e0780685396daab6f47cae74c22fa20638c9b71883d07',
					signatures: [],
					confirmations: 506685,
					asset: {},
				},
			},
		};

		it('should list a defined transaction', function () {
			var callback = sinon.spy();
			var transactionId= '7520138931049441691';
			var options = {
				id: transactionId
			};
			sinon.stub(LSK, 'sendRequest').callsArgWith(2, expectedResponse);

			LSK.getTransaction(transactionId, callback);

			(LSK.sendRequest.calledWith('transactions', options)).should.be.true();
			(callback.called).should.be.true();
			(callback.calledWith(expectedResponse)).should.be.true();
			LSK.sendRequest.restore();
		});
	});

	describe('#listVotes', function () {
		var expectedResponse = {
			body: {
				success: true,
				delegates: [{
					username: 'thepool',
					address: '10839494368003872009L',
					publicKey: 'b002f58531c074c7190714523eec08c48db8c7cfc0c943097db1a2e82ed87f84',
					vote: '2317408239538758',
					producedblocks: 13357,
					missedblocks: 373,
					rate: 1,
					rank: 1,
					approval: 21.66,
					productivity: 97.28,
				}],
			},
		};

		it('should list votes of an account', function () {
			var callback = sinon.spy();
			var address= '16010222169256538112L';
			var options = {
				address: address
			};
			sinon.stub(LSK, 'sendRequest').callsArgWith(2, expectedResponse);

			LSK.listVotes(address, callback);

			(LSK.sendRequest.calledWith('votes', options)).should.be.true();
			(callback.called).should.be.true();
			(callback.calledWith(expectedResponse)).should.be.true();
			LSK.sendRequest.restore();
		});
	});

	describe('#listVoters', function () {
		var expectedResponse = {
			body: {
				success: true,
				accounts: [{
					username: null,
					address: '7288548278191946381L',
					publicKey: '8c325dc9cabb3a81e40d7291a023a1574629600931fa21cc4fcd87b2d923214f',
					balance: '0',
				}],
			},
		};

		it('should list voters of an account', function () {
			var callback = sinon.spy();
			var address= '7288548278191946381L';
			var options = {
				address: address
			};
			sinon.stub(LSK, 'sendRequest').callsArgWith(2, expectedResponse);

			LSK.listVoters(address, callback);

			(LSK.sendRequest.calledWith('voters', options)).should.be.true();
			(callback.called).should.be.true();
			(callback.calledWith(expectedResponse)).should.be.true();
			LSK.sendRequest.restore();
		});
	});

	describe('#sendLSK', function () {
		var expectedResponse = {
			body: { success: true, transactionId: '8921031602435581844' }
		};
		it('should send testnet LSK', function () {
			var options = {
				ssl: false,
				node: '',
				randomPeer: true,
				testnet: true,
				port: '7000',
				bannedPeers: []
			};
			var callback = sinon.spy();
			var LSKnode = lisk.api(options);
			var secret = 'soap arm custom rhythm october dove chunk force own dial two odor';
			var secondSecret = 'spider must salmon someone toe chase aware denial same chief else human';
			var recipient = '10279923186189318946L';
			var amount = 100000000;
			sinon.stub(LSKnode, 'sendRequest').callsArgWith(2, expectedResponse);

			LSKnode.sendLSK(recipient, amount, secret, secondSecret, callback);

			(LSKnode.sendRequest.calledWith('transactions', {
				recipientId: recipient,
				amount: amount,
				secret: secret,
				secondSecret: secondSecret
			})).should.be.true();

			(callback.called).should.be.true();
			(callback.calledWith(expectedResponse)).should.be.true();
			LSKnode.sendRequest.restore();
		});
	});

	describe('#checkReDial', function () {

		it('should check if all the peers are already banned', function () {
			var LSK = lisk.api();
			(privateApi.checkReDial.call(LSK)).should.be.equal(true);
		});

		it('should be able to get a new node when current one is not reachable', function (done) {
			lisk.api({ node: '123', randomPeer: true }).sendRequest('blocks/getHeight', {}, function (result) {
				(result).should.be.type('object');
				done();
			});
		});

		it('should recognize that now all the peers are banned for mainnet', function () {
			var thisLSK = lisk.api();
			thisLSK.bannedPeers = lisk.api().defaultPeers;

			(privateApi.checkReDial.call(thisLSK)).should.be.equal(false);
		});

		it('should recognize that now all the peers are banned for testnet', function () {
			var thisLSK = lisk.api({ testnet: true });
			thisLSK.bannedPeers = lisk.api().defaultTestnetPeers;

			(privateApi.checkReDial.call(thisLSK)).should.be.equal(false);
		});

		it('should recognize that now all the peers are banned for ssl', function () {
			var thisLSK = lisk.api({ssl: true});
			thisLSK.bannedPeers = lisk.api().defaultSSLPeers;

			(privateApi.checkReDial.call(thisLSK)).should.be.equal(false);
		});

		it('should stop redial when all the peers are banned already', function (done) {
			var thisLSK = lisk.api();
			thisLSK.bannedPeers = lisk.api().defaultPeers;
			thisLSK.currentPeer = '';

			thisLSK.sendRequest('blocks/getHeight').then(function (e) {
				(e.message).should.be.equal('could not create http request to any of the given peers');
				done();
			});
		});

		it('should redial to new node when randomPeer is set true', function (done) {
			var thisLSK = lisk.api({ randomPeer: true, node: '123' });

			thisLSK.getAccount('12731041415715717263L', function (data) {
				(data).should.be.ok;
				(data.success).should.be.equal(true);
				done();
			});
		});

		it('should not redial to new node when randomPeer is set to true but unknown nethash provided', function () {
			var thisLSK = lisk.api({ randomPeer: true, node: '123', nethash: '123' });

			(privateApi.checkReDial.call(thisLSK)).should.be.equal(false);
		});

		it('should redial to mainnet nodes when nethash is set and randomPeer is true', function () {
			var thisLSK = lisk.api({ randomPeer: true, node: '123', nethash: 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511' });

			(privateApi.checkReDial.call(thisLSK)).should.be.equal(true);
			(thisLSK.testnet).should.be.equal(false);
		});

		it('should redial to testnet nodes when nethash is set and randomPeer is true', function () {
			var thisLSK = lisk.api({ randomPeer: true, node: '123', nethash: 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba' });

			(privateApi.checkReDial.call(thisLSK)).should.be.equal(true);
			(thisLSK.testnet).should.be.equal(true);
		});

		it('should not redial when randomPeer is set false', function () {
			var thisLSK = lisk.api({ randomPeer: false});

			(privateApi.checkReDial.call(thisLSK)).should.be.equal(false);
		});
	});

	describe('#sendRequest with promise', function () {

		it('should be able to use sendRequest as a promise for GET', function (done) {
			lisk.api().sendRequest('blocks/getHeight', {}).then(function (result) {
				(result).should.be.type('object');
				(result.success).should.be.equal(true);
				(result.height).should.be.type('number');
				done();
			});
		});

		it('should be able to use sendRequest as a promise for POST', function (done) {
			var options = {
				ssl: false,
				node: '',
				randomPeer: true,
				testnet: true,
				port: '7000',
				bannedPeers: []
			};

			var LSKnode = lisk.api(options);
			var secret = 'soap arm custom rhythm october dove chunk force own dial two odor';
			var secondSecret = 'spider must salmon someone toe chase aware denial same chief else human';
			var recipient = '10279923186189318946L';
			var amount = 100000000;

			LSKnode.sendRequest('transactions', { recipientId: recipient, secret: secret, secondSecret: secondSecret, amount: amount }).then(function (result) {
				(result).should.be.type('object');
				(result).should.be.ok;
				done();
			});
		});
	});

	describe('#listMultisignatureTransactions', function () {

		it('should list all current not signed multisignature transactions', function (done) {
			lisk.api().listMultisignatureTransactions(function (result) {
				(result).should.be.ok;
				(result).should.be.type('object');
				done();
			});
		});
	});

	describe('#getMultisignatureTransaction', function () {

		it('should get a multisignature transaction by id', function (done) {
			lisk.api().getMultisignatureTransaction('123', function (result) {
				(result).should.be.ok;
				(result).should.be.type('object');
				done();
			});
		});
	});

	describe('#createDelegate', function () {

		it('should be able to create a delegate', function () {

			var LSK = lisk.api({ testnet: true });
			var callback = sinon.spy();

			sinon.stub(LSK, 'broadcastSignedTransaction').callsArg(1);

			LSK.createDelegate('secret', 'testUsername', 'secondSecret', callback);

			(LSK.broadcastSignedTransaction.called).should.be.true();
			(LSK.broadcastSignedTransaction.args[0][0].type).should.be.equal(2);
			(LSK.broadcastSignedTransaction.args[0][0].fee).should.be.equal(2500000000);
			(LSK.broadcastSignedTransaction.args[0][0].asset.delegate.username).should.be.equal('testUsername');
			LSK.broadcastSignedTransaction.restore();

		});

	});

	describe('#multiSignatureSign', function () {

		it('should be able to create a multiSignatureSign', function () {

			var LSK = lisk.api({ testnet: true });
			var callback = sinon.spy();

			sinon.stub(LSK, 'broadcastSignedTransaction').yields();

			var tx = {
				amount: '100',
				asset: {},
				fee: 10000000,
				id: '15936820115091968386',
				recipientId: '784237489382434L',
				requesterPublicKey: '5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09',
				senderPublicKey: '5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09',
				signSignature: 'd06822a99d799b90dcf739acfbbc9a03a946d8fcb649545a32269de2d09d7ea11bf5a23ac0a4965b0d178a01c3277594893deaed5185085c5f948e7897081b02',
				signature: '5ad2f6454d92e163c9e4edfdff5b1b8b6684b7d83654ecf63d16edb21bbd085aefe8d2bd7f75cca9425fc03fac90eb69602d686ca24e12242557bf990840570a',
				signatures: [],
				timestamp: 34702079,
				type: 0
			};

			LSK.multiSignatureSign('secret', tx, callback);

			(LSK.broadcastSignedTransaction.called).should.be.true();
			(LSK.broadcastSignedTransaction.args[0][0]).should.be.equal('5ad2f6454d92e163c9e4edfdff5b1b8b6684b7d83654ecf63d16edb21bbd085aefe8d2bd7f75cca9425fc03fac90eb69602d686ca24e12242557bf990840570a');
			LSK.broadcastSignedTransaction.restore();

		});

	});

	describe('#createMultisignature', function () {

		it('should be able to create a multisignature account', function () {

			var minimumSignatures = 6;
			var requestLifeTime = 8;
			var multiSignaturePublicKeyArray = ['+123456789', '+1236345489', '+123452349', '-987654321', '+12323432489','+1234234789', '-82348375839'];

			var LSK = lisk.api({ testnet: true });
			var callback = sinon.spy();

			sinon.stub(LSK, 'broadcastSignedTransaction').callsArg(1);


			LSK.createMultisignature('secret', multiSignaturePublicKeyArray, requestLifeTime, minimumSignatures, 'secondSecret', callback);

			(LSK.broadcastSignedTransaction.args[0][0].type).should.be.equal(4);
			(LSK.broadcastSignedTransaction.args[0][0].fee).should.be.equal(4000000000);
			(LSK.broadcastSignedTransaction.args[0][0].asset.multisignature).should.be.type('object');
			LSK.broadcastSignedTransaction.restore();

		});

	});

	describe('#sendVotes', function () {

		it('should be able to send votes', function () {

			var votes = ['+dd786687dd2399605ce8fe70212d078db1a2fc6effba127defb176a004cec6d4', '+adc4942d3821c8803f8794646c3e3934eb08d3768dff3f2fd9e9e6030635e344', '-ae5afc2db90302dbf9253640467dfbc107b29ed35b8752df9775acd7f644992c'];

			var LSK = lisk.api({ testnet: true });
			var callback = sinon.spy();

			sinon.stub(LSK, 'broadcastSignedTransaction').callsArg(1);


			LSK.sendVotes('secret', votes, 'secondSecret', callback);

			(LSK.broadcastSignedTransaction.args[0][0].type).should.be.equal(3);
			(LSK.broadcastSignedTransaction.args[0][0].fee).should.be.equal(100000000);
			(LSK.broadcastSignedTransaction.args[0][0].asset.votes).should.be.eql(votes);
			LSK.broadcastSignedTransaction.restore();

		});

	});

	describe('#broadcastSignedTransaction', function () {

		it('should be able to broadcast a finished and signed transaction', function (done) {

			var LSKAPI = lisk.api({testnet: true});
			var amount = 0.001 * Math.pow(10, 8);
			var transaction = lisk.transaction.createTransaction('1859190791819301L', amount, 'rebuild price rigid sight blood kangaroo voice festival glow treat topic weapon');

			LSKAPI.broadcastSignedTransaction(transaction, function (result) {
				(result.success).should.be.true;
				done();
			});

		});

	});

});
