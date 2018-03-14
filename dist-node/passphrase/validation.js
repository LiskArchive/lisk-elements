'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getPassphraseValidationErrors = exports.locateConsecutiveWhitespaces = exports.locateUppercaseCharacters = exports.countUppercaseCharacters = exports.countPassphraseWords = exports.countPassphraseWhitespaces = undefined;

var _bip = require('bip39');

var _bip2 = _interopRequireDefault(_bip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var whitespaceRegExp = /\s/g; /*
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

var uppercaseRegExp = /[A-Z]/g;

var countPassphraseWhitespaces = exports.countPassphraseWhitespaces = function countPassphraseWhitespaces(passphrase) {
	var whitespaceMatches = passphrase.match(whitespaceRegExp);
	return whitespaceMatches ? whitespaceMatches.length : 0;
};

var countPassphraseWords = exports.countPassphraseWords = function countPassphraseWords(passphrase) {
	return passphrase.split(' ').filter(Boolean).length;
};

var countUppercaseCharacters = exports.countUppercaseCharacters = function countUppercaseCharacters(passphrase) {
	var uppercaseCharacterMatches = passphrase.match(uppercaseRegExp) || [];
	return uppercaseCharacterMatches.length;
};

var locateUppercaseCharacters = exports.locateUppercaseCharacters = function locateUppercaseCharacters(passphrase) {
	var positions = [];
	for (var i = 0; i < passphrase.length; i += 1) {
		if (passphrase[i].match(uppercaseRegExp) !== null) {
			positions.push(i);
		}
	}
	return positions;
};

var locateConsecutiveWhitespaces = exports.locateConsecutiveWhitespaces = function locateConsecutiveWhitespaces(passphrase) {
	var positions = [];
	var passphraseLength = passphrase.length;
	var lastIndex = passphraseLength - 1;
	if (passphrase[0].match(whitespaceRegExp) !== null) {
		positions.push(0);
	}

	for (var i = 1; i < lastIndex; i += 1) {
		if (passphrase[i].match(whitespaceRegExp) && passphrase[i - 1].match(whitespaceRegExp)) {
			positions.push(i);
		}
	}

	if (passphrase[lastIndex].match(whitespaceRegExp) !== null) {
		positions.push(lastIndex);
	}

	return positions;
};

var getPassphraseValidationErrors = exports.getPassphraseValidationErrors = function getPassphraseValidationErrors(passphrase, wordlist) {
	var expectedWords = 12;
	var expectedWhitespaces = 11;
	var expectedUppercaseCharacterCount = 0;
	var wordsInPassphrase = countPassphraseWords(passphrase);
	var whiteSpacesInPassphrase = countPassphraseWhitespaces(passphrase);
	var uppercaseCharacterInPassphrase = countUppercaseCharacters(passphrase);
	var errors = [];

	if (wordsInPassphrase !== expectedWords) {
		var passphraseWordError = {
			code: 'INVALID_AMOUNT_OF_WORDS',
			message: 'Passphrase contains ' + wordsInPassphrase + ' words instead of expected ' + expectedWords + '. Please check the passphrase.',
			expected: expectedWords,
			actual: wordsInPassphrase
		};
		errors.push(passphraseWordError);
	}

	if (whiteSpacesInPassphrase > expectedWhitespaces) {
		var whiteSpaceError = {
			code: 'INVALID_AMOUNT_OF_WHITESPACES',
			message: 'Passphrase contains ' + whiteSpacesInPassphrase + ' whitespaces instead of expected ' + expectedWhitespaces + '. Please check the passphrase.',
			expected: expectedWhitespaces,
			actual: whiteSpacesInPassphrase,
			location: locateConsecutiveWhitespaces(passphrase)
		};
		errors.push(whiteSpaceError);
	}

	if (uppercaseCharacterInPassphrase !== expectedUppercaseCharacterCount) {
		var uppercaseCharacterError = {
			code: 'INVALID_AMOUNT_OF_UPPERCASE_CHARACTER',
			message: 'Passphrase contains ' + uppercaseCharacterInPassphrase + ' uppercase character instead of expected ' + expectedUppercaseCharacterCount + '. Please check the passphrase.',
			expected: expectedUppercaseCharacterCount,
			actual: uppercaseCharacterInPassphrase,
			location: locateUppercaseCharacters(passphrase)
		};
		errors.push(uppercaseCharacterError);
	}

	if (!_bip2.default.validateMnemonic(passphrase, wordlist || _bip2.default.wordlists.english)) {
		var validationError = {
			code: 'INVALID_MNEMONIC',
			message: 'Passphrase is not a valid mnemonic passphrase. Please check the passphrase.',
			expected: true,
			actual: false
		};
		errors.push(validationError);
	}

	return errors;
};