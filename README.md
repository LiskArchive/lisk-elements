# <a href="http://liskhq.github.io/lisk-js/">Lisk-JS</a> (soon to be renamed Lisk-Elements)

Lisk JS is a JavaScript library for [Lisk - the cryptocurrency and blockchain application platform](https://github.com/LiskHQ/lisk). It allows developers to create offline transactions and broadcast them onto the network. It also allows developers to interact with the core Lisk API, for retrieval of collections and single records of data located on the Lisk blockchain. Its main benefit is that it does not require a locally installed Lisk node, and instead utilizes the existing nodes on the network. It can be used from the client as a [browserify](http://browserify.org/) compiled module, or on the server as a standard Node.js module.

[![Build Status](https://jenkins.lisk.io/buildStatus/icon?job=lisk-js/development)](https://jenkins.lisk.io/job/lisk-js/job/development/)
[![Coverage Status](https://coveralls.io/repos/github/LiskHQ/lisk-js/badge.svg?branch=development)](https://coveralls.io/github/LiskHQ/lisk-js?branch=development)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0)
[![GitHub release](https://img.shields.io/badge/version-1.0.0-blue.svg)](#)

## Browser

```html
<script src="./lisk-js.js"></script>
<script>
	lisk.APIClient({}).get.delegates({ username: 'oliver' }).then(console.log);
</script>
```

## CDN

https://gitcdn.xyz/repo/LiskHQ/lisk-js/browser/lisk-js.js<br/>
```html
<script src="https://gitcdn.xyz/repo/LiskHQ/lisk-js/browser/lisk-js.js"></script>
```
Or minified:
https://gitcdn.xyz/repo/LiskHQ/lisk-js/browser/lisk-js.min.js<br/>
```html
<script src="https://gitcdn.xyz/repo/LiskHQ/lisk-js/browser/lisk-js.min.js"></script>
```

## Server

### Install
```
$ npm install lisk-js --save
```

To learn more about the API or to experiment with some data, please go to the GitHub page:

http://liskhq.github.io/lisk-js/

## Tests

```
npm test
```

Tests written using mocha + chai.

## Documentation

- [Install](https://docs.lisk.io/docs/lisk-js-installation)
- [API](https://docs.lisk.io/docs/api-functions)
	- [Settings](https://docs.lisk.io/docs/api)
	- [API Functions](https://docs.lisk.io/docs/api-functions)
	- [Network Functions](https://docs.lisk.io/docs/network-functions)
- [Crypto](https://docs.lisk.io/docs/crypto-functions)
- [Transactions](https://docs.lisk.io/docs/transactions-1)
	- [Create Transaction](https://docs.lisk.io/docs/transactions-1#section-createtransaction)
	- [Create Vote](https://docs.lisk.io/docs/transactions-1#section-createvote)
	- [Create Dapp](https://docs.lisk.io/docs/transactions-1#section-createdapp)
	- [Create Delegate](https://docs.lisk.io/docs/transactions-1#section-createdelegate)
	- [Create Second Signature](https://docs.lisk.io/docs/transactions-1#section-createtransaction)
	- [Create Multisignature Account](https://docs.lisk.io/docs/transactions-1#section-createmultisignature)
	- [Sign Multisignature Transaction](https://docs.lisk.io/docs/transactions-1#section-signtransaction)

## Documentation for contributors

Several files relevant for contributors can be found in the `docs`
directory, if you are planning to contribute, please have a look at:

* `CODE_OF_CONDUCT.md`
* `CONTRIBUTING.md`
* `ISSUE_TEMPLATE.md` and `PULL_REQUEST_TEMPLATE.md`
* Additionally, in the root of the project is the `LICENSE` file.

## Project structure

* Source code should go in `src`, test code should go in `test`.
* File and directory names should be `underscore_separated` for best cross-file
	system compatibility. (I.e. not in camel case etc.)
* nyc output goes into `.nyc_output`, and built files are put into a `dist`
	directory which is created when needed.
* Files you do not want to commit can be placed in `.idea` or `tmp` (you will
	need to create these directories yourself).

## Contributors

https://github.com/LiskHQ/lisk-js/graphs/contributors

## License

Copyright © 2016-2018 Lisk Foundation

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the [GNU General Public License](https://github.com/LiskHQ/lisk-js/tree/master/LICENSE) along with this program.  If not, see <http://www.gnu.org/licenses/>.
