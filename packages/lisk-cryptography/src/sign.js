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
import { hexToBuffer, bufferToHex } from './convert';
import { getPrivateAndPublicKeyBytesFromPassphrase } from './keys';

const createHeader = text => `-----${text}-----`;
const signedMessageHeader = createHeader('BEGIN LISK SIGNED MESSAGE');
const messageHeader = createHeader('MESSAGE');
const publicKeyHeader = createHeader('PUBLIC KEY');
const secondPublicKeyHeader = createHeader('SECOND PUBLIC KEY');
const signatureHeader = createHeader('SIGNATURE');
const secondSignatureHeader = createHeader('SECOND SIGNATURE');
const signatureFooter = createHeader('END LISK SIGNED MESSAGE');

export const signMessageWithPassphrase = (message, passphrase) => {
	const msgBytes = Buffer.from(message, 'utf8');
	const { privateKey, publicKey } = getPrivateAndPublicKeyBytesFromPassphrase(
		passphrase,
	);
	const signature = naclInstance.crypto_sign_detached(msgBytes, privateKey);

	return {
		message,
		publicKey: bufferToHex(publicKey),
		signature: bufferToHex(signature),
	};
};

export const verifyMessageWithPublicKey = ({
	message,
	signature,
	publicKey,
}) => {
	const msgBytes = Buffer.from(message, 'utf8');
	const signatureBytes = hexToBuffer(signature);
	const publicKeyBytes = hexToBuffer(publicKey);

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid publicKey, expected 32-byte publicKey');
	}

	if (signatureBytes.length !== naclInstance.crypto_sign_BYTES) {
		throw new Error('Invalid signature length, expected 64-byte signature');
	}

	return naclInstance.crypto_sign_verify_detached(
		signatureBytes,
		msgBytes,
		publicKeyBytes,
	);
};

export const signMessageWithTwoPassphrases = (
	message,
	passphrase,
	secondPassphrase,
) => {
	const msgBytes = Buffer.from(message, 'utf8');
	const keypairBytes = getPrivateAndPublicKeyBytesFromPassphrase(passphrase);
	const secondKeypairBytes = getPrivateAndPublicKeyBytesFromPassphrase(
		secondPassphrase,
	);

	const signature = naclInstance.crypto_sign_detached(
		msgBytes,
		keypairBytes.privateKey,
	);
	const secondSignature = naclInstance.crypto_sign_detached(
		msgBytes,
		secondKeypairBytes.privateKey,
	);

	return {
		message,
		publicKey: bufferToHex(keypairBytes.publicKey),
		secondPublicKey: bufferToHex(secondKeypairBytes.publicKey),
		signature: bufferToHex(signature),
		secondSignature: bufferToHex(secondSignature),
	};
};

export const verifyMessageWithTwoPublicKeys = ({
	message,
	signature,
	secondSignature,
	publicKey,
	secondPublicKey,
}) => {
	const messageBytes = Buffer.from(message, 'utf8');
	const signatureBytes = hexToBuffer(signature);
	const secondSignatureBytes = hexToBuffer(secondSignature);
	const publicKeyBytes = hexToBuffer(publicKey);
	const secondPublicKeyBytes = hexToBuffer(secondPublicKey);

	if (signatureBytes.length !== naclInstance.crypto_sign_BYTES) {
		throw new Error(
			'Invalid first signature length, expected 64-byte signature',
		);
	}

	if (secondSignatureBytes.length !== naclInstance.crypto_sign_BYTES) {
		throw new Error(
			'Invalid second signature length, expected 64-byte signature',
		);
	}

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid first publicKey, expected 32-byte publicKey');
	}

	if (secondPublicKeyBytes.length !== 32) {
		throw new Error('Invalid second publicKey, expected 32-byte publicKey');
	}

	const verifyFirstSignature = () =>
		naclInstance.crypto_sign_verify_detached(
			signatureBytes,
			messageBytes,
			publicKeyBytes,
		);
	const verifySecondSignature = () =>
		naclInstance.crypto_sign_verify_detached(
			secondSignatureBytes,
			messageBytes,
			secondPublicKeyBytes,
		);

	return verifyFirstSignature() && verifySecondSignature();
};

export const printSignedMessage = ({
	message,
	signature,
	publicKey,
	secondSignature,
	secondPublicKey,
}) =>
	[
		signedMessageHeader,
		messageHeader,
		message,
		publicKeyHeader,
		publicKey,
		secondPublicKey ? secondPublicKeyHeader : null,
		secondPublicKey,
		signatureHeader,
		signature,
		secondSignature ? secondSignatureHeader : null,
		secondSignature,
		signatureFooter,
	]
		.filter(Boolean)
		.join('\n');

export const signAndPrintMessage = (message, passphrase, secondPassphrase) => {
	const signedMessage = secondPassphrase
		? signMessageWithTwoPassphrases(message, passphrase, secondPassphrase)
		: signMessageWithPassphrase(message, passphrase);

	return printSignedMessage(signedMessage);
};

export const signDataWithPrivateKey = (data, privateKey) => {
	const signature = naclInstance.crypto_sign_detached(data, privateKey);
	return bufferToHex(signature);
};

export const signDataWithPassphrase = (data, passphrase) => {
	const { privateKey } = getPrivateAndPublicKeyBytesFromPassphrase(passphrase);
	return signDataWithPrivateKey(data, privateKey);
};

export const signData = signDataWithPassphrase;

export const verifyData = (data, signature, publicKey) =>
	naclInstance.crypto_sign_verify_detached(
		hexToBuffer(signature),
		data,
		hexToBuffer(publicKey),
	);
