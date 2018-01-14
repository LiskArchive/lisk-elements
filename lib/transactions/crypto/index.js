const {
	bufferToHex,
	hexToBuffer,
	useFirstEightBufferEntriesReversed
} = require('./convert');

const {
	verifyMessageWithPublicKey,
	signMessageWithSecret,
	signAndPrintMessage,
	printSignedMessage,
	encryptMessageWithSecret,
	decryptMessageWithSecret,
	convertPublicKeyEd2Curve,
	convertPrivateKeyEd2Curve,
	decryptPassphraseWithPassword,
	encryptPassphraseWithPassword
} = require('./sign');

const {
	getPrivateAndPublicKeyFromSecret,
	getRawPrivateAndPublicKeyFromSecret,
	getAddressFromPublicKey
} = require('./keys');
const {getSha256Hash} = require('./hash');

module.exports = {
	bufferToHex,
	hexToBuffer,
	useFirstEightBufferEntriesReversed,
	verifyMessageWithPublicKey,
	signMessageWithSecret,
	signAndPrintMessage,
	printSignedMessage,
	encryptMessageWithSecret,
	decryptMessageWithSecret,
	convertPublicKeyEd2Curve,
	convertPrivateKeyEd2Curve,
	decryptPassphraseWithPassword,
	encryptPassphraseWithPassword,
	getPrivateAndPublicKeyFromSecret,
	getRawPrivateAndPublicKeyFromSecret,
	getAddressFromPublicKey,
	getSha256Hash,
};
