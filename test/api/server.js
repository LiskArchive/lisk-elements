if (typeof module !== 'undefined' && module.exports) {
	var common = require('../common');
	var lisk = common.lisk;
	var privateApi = common.privateApi;
	var utils = common.utils;
	var sinon = common.sinon;
	process.env.NODE_ENV = 'test';
}

var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

app.listen(port);

console.log('todo list RESTful API server started on: ' + port);


app.get('/accounts', function (req, res) {

	var accountObject = {
		"accounts": [
			{
				"address": "12668885769632475474L",
				"balance": 1081560729258,
				"unconfirmedBalance": 0,
				"publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
				"secondPublicKey": null,
				"delegate": {
					"username": "isabella",
					"vote": 1081560729258,
					"producedBlocks": 20131,
					"missedBlocks": 427,
					"rate": 91,
					"approval": 14.22,
					"productivity": 96.41
				},
				"multisignatures": {
					"min": 2,
					"lifetime": 72,
					"signers": [
						{
							"address": "6251001604903637008L",
							"publicKey": "2ca9a7143fc721fdc540fef893b27e8d648d2288efa61e56264edf01a2c23079"
						},
						{
							"address": "12668885769632475474L",
							"publicKey": "a4465fd76c16fcc458448076372abf1912cc5b150663a64dffefe550f96feadd"
						},
						{
							"address": "12668123452434343274L",
							"publicKey": "a233323232235677777754465fd76c16fcc434222663a64dffefe550f96feadd"
						}
					]
				}
			}
		]
	}

	res.send(accountObject);
});

app.get('/blocks', function (req, res) {

	var accountObject = {
		"blocks": [
			{
				"blockId": 6258354802676166000,
				"height": 1081560729258,
				"timestamp": 28227090,
				"generatorAddress": "12668885769632475474L",
				"generatorPublicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
				"payloadLength": 117,
				"payloadHash": "4e4d91be041e09a2e54bb7dd38f1f2a02ee7432ec9f169ba63cd1f193a733dd2",
				"blockSignature": "a3733254aad600fa787d6223002278c3400be5e8ed4763ae27f9a15b80e20c22ac9259dc926f4f4cabdf0e4f8cec49308fa8296d71c288f56b9d1e11dfe81e07",
				"confirmations": 200,
				"previousBlockId": 15918760246746894000,
				"forged": {
					"numberOfTransactions": 15,
					"totalAmount": 150000000,
					"totalFee": 15000000,
					"reward": 50000000,
					"totalForged": 65000000
				}
			}
		]
	}

	res.send(accountObject);
});

app.get('/delegates', function (req, res) {

	var accountObject = {
		"delegates": [
			{
				"username": "isabella",
				"vote": 1081560729258,
				"producedBlocks": 20131,
				"missedBlocks": 427,
				"rate": 91,
				"approval": 14.22,
				"productivity": 96.41
			}
		]
	}

	res.send(accountObject);
});


app.get('/delegates/forging', function (req, res) {

	var accountObject = {
		"publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
		"forging": true
	}

	res.send(accountObject);
});

app.get('/node/constants', function (req, res) {

	var accountObject = {
		"epoch": "2016-05-24T17:00:00.000Z",
		"milestone": 1081560729258,
		"build": "v09:54:35 12/04/2017\n",
		"commit": "7199d4b67c3575d5f99d1c29436a02977eeb01a7",
		"version": "v0.8.0",
		"nethash": "ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511",
		"supply": 10575384500000000,
		"reward": 500000000,
		"fees": {
			"send": 10000000,
			"vote": 100000000,
			"secondSignature": 500000000,
			"delegate": 2500000000,
			"multisignature": 500000000,
			"dappRegistration": 2500000000,
			"dappWithdrawal": 10000000,
			"dappDeposit": 10000000
		}
	}

	res.send(accountObject);
});

app.get('/node/status', function (req, res) {

	var accountObject = {
		"syncing": false,
		"height": 123,
		"networkHeight": 123,
		"broadhash": "258974416d58533227c6a3da1b6333f0541b06c65b41e45cf31926847a3db1ea",
		"consensus": 95
	}

	res.send(accountObject);
});


app.get('/peers', function (req, res) {

	var accountObject = {
		"peers": [
			{
				"ip": "127.0.0.1",
				"port": 8000,
				"version": "v0.8.0",
				"state": 2,
				"height": 123,
				"broadhash": "258974416d58533227c6a3da1b6333f0541b06c65b41e45cf31926847a3db1ea"
			}
		],
		"totalReturned": 1,
		"totalCount": 100
	}

	res.send(accountObject);
});

app.get('/transactions', function (req, res) {

	var accountObject = {
		"transactions": [
			{
				"transactionId": 15,
				"amount": 15000000,
				"type": 0,
				"height": 123,
				"blockId": 6258354802676166000,
				"timestamp": 28227090,
				"senderId": "6251001604903637008L",
				"recipientId": "12668885769632475474L",
				"signature": "72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd105ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a",
				"secondSignature": "5ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd10",
				"multisignatures": [
					"72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd105ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a",
					"61a602119ce063924e24bd81f671d5e277275c5409e8b1147870218003b341437dd2179fa73dc725eda62639128a2e528006b6ed8565f5532bf1689f49c9de06"
				],
				"asset": {},
				"confirmations": 188
			}
		]
	}

	res.send(accountObject);
});

app.get('/transactions/unsigned', function (req, res) {

	var accountObject = {
		"transactions": [
			{
				"transactionId": 15,
				"amount": 0,
				"fee": 15000000,
				"type": 4,
				"timestamp": 28227090,
				"senderId": "6251001604903637008L",
				"recipientId": null,
				"signature": "72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd105ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a",
				"asset": {
					"multisignature": {
						"min": 3,
						"lifetime": 72,
						"keysgroup": [
							{
								"address": "6251001604903637008L",
								"publicKey": "+2ca9a7143fc721fdc540fef893b27e8d648d2288efa61e56264edf01a2c23079"
							},
							{
								"address": "12668885769632475474L",
								"publicKey": "+a4465fd76c16fcc458448076372abf1912cc5b150663a64dffefe550f96feadd"
							},
							{
								"address": "12668123452434343274L",
								"publicKey": "+a233323232235677777754465fd76c16fcc434222663a64dffefe550f96feadd"
							}
						]
					}
				},
				"signatures": [
					{
						"address": "6251001604903637008L",
						"publicKey": "2ca9a7143fc721fdc540fef893b27e8d648d2288efa61e56264edf01a2c23079",
						"signature": "72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd105ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a",
						"timestamp": 100000
					},
					{
						"address": "12668885769632475474L",
						"publicKey": "2ca9a7143fc721fdc540fef893b27e8d648d2288efa61e56264edf01a2c23079",
						"signature": "2821d93a742c4edf5fd960efad41a4def7bf0fd0f7c09869aed524f6f52bf9c97a617095e2c712bd28b4279078a29509b339ac55187854006591aa759784c205",
						"timestamp": 102000
					}
				],
				"propagation": {
					"relays": 1,
					"receivedAt": 28227092
				},
				"multisignatures": {
					"min": 3,
					"currentSignatures": 2,
					"lifetime": 72,
					"ready": false
				}
			}
		]
	}

	res.send(accountObject);
});

app.get('/transactions/unsigned', function (req, res) {

	var accountObject = {
		"transactions": [
			{
				"transactionId": 15,
				"amount": 15000000,
				"fee": 1000000,
				"type": 0,
				"timestamp": 28227090,
				"senderId": "6251001604903637008L",
				"recipientId": "12668885769632475474L",
				"signature": "72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd105ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a",
				"asset": {},
				"propagation": {
					"relays": 1,
					"receivedAt": 28227092
				}
			}
		]
	}

	res.send(accountObject);
});

app.get('/transactions/unsigned', function (req, res) {

	var accountObject = {
		"transactions": [
			{
				"transactionId": 15,
				"amount": 15000000,
				"type": 0,
				"height": 123,
				"blockId": 6258354802676166000,
				"timestamp": 28227090,
				"senderId": "6251001604903637008L",
				"recipientId": "12668885769632475474L",
				"signature": "72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd105ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a",
				"secondSignature": "5ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd10",
				"asset": {},
				"propagation": {
					"relays": 1,
					"receivedAt": 28227092
				}
			}
		]
	}

	res.send(accountObject);
});

app.get('/votes', function (req, res) {

	var accountObject = {
		"address": "6251001604903637008L",
		"balance": 15000000,
		"votesUsed": 2,
		"votesAvailable": 99,
		"votes": [
			{
				"address": "12668885769632475474L",
				"publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
				"username": "isabella"
			},
			{
				"address": "5241063366434807683L",
				"publicKey": "db4b4db208667f9266e8a4d7fad9d8b2e711891175a21ee5f5f2cd088d1d8083",
				"username": "forger_of_lisk"
			}
		]
	}

	res.send(accountObject);
});

app.get('/voters', function (req, res) {

	var accountObject = {
		"address": "6251001604903637008L",
		"username": "eely_delving",
		"weight": 1000000100,
		"votes": 2,
		"voters": [
			{
				"address": "6251001604903637008L",
				"balance": 1000000000
			},
			{
				"address": "12668885769632475474L",
				"balance": 100
			}
		]
	}

	res.send(accountObject);
});