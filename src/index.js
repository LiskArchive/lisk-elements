/**
 * Index module comprising all submodules of lisk-js.
 * @module lisk
 * @main lisk
 */

global.Buffer = global.Buffer || require('buffer').Buffer;
global.naclFactory = require('js-nacl');

global.naclInstance;
naclFactory.instantiate(function (nacl) {
	naclInstance = nacl;
});

lisk = {
	crypto : require('./transactions/crypto.js'),
	dapp: require('./transactions/dapp.js'),
	delegate : require('./transactions/delegate.js'),
	multisignature : require('./transactions/multisignature.js'),
	signature : require('./transactions/signature.js'),
	transaction : require('./transactions/transaction.js'),
	transfer: require('./transactions/transfer'),
	vote : require('./transactions/vote.js'),
	api: require('./api/liskApi'),
	slots: require('./time/slots')
};

module.exports = lisk;
