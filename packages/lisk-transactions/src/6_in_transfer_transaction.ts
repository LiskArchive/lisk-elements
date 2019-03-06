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
import * as BigNum from 'browserify-bignum';
import {
	BaseTransaction,
	ENTITY_ACCOUNT,
	ENTITY_TRANSACTION,
	StateStore,
} from './base_transaction';
import { IN_TRANSFER_FEE } from './constants';
import { TransactionError, TransactionMultiError } from './errors';
import { Account, TransactionJSON } from './transaction_types';
import { convertBeddowsToLSK, verifyAmountBalance } from './utils';
import { validator } from './utils/validation';

const TRANSACTION_DAPP_TYPE = 5;
const TRANSACTION_INTRANSFER_TYPE = 6;

export interface InTransferAsset {
	readonly inTransfer: {
		readonly dappId: string;
	};
}

export const inTransferAssetTypeSchema = {
	type: 'object',
	required: ['inTransfer'],
	properties: {
		inTransfer: {
			type: 'object',
			required: ['dappId'],
			properties: {
				dappId: {
					type: 'string',
				},
			},
		},
	},
};

export const inTransferAssetFormatSchema = {
	type: 'object',
	required: ['inTransfer'],
	properties: {
		inTransfer: {
			type: 'object',
			required: ['dappId'],
			properties: {
				dappId: {
					type: 'string',
					format: 'id',
				},
			},
		},
	},
};

export class InTransferTransaction extends BaseTransaction {
	public readonly asset: InTransferAsset;

	public constructor(tx: TransactionJSON) {
		super(tx);
		const typeValid = validator.validate(inTransferAssetTypeSchema, tx.asset);
		const errors = validator.errors
			? validator.errors.map(
					error =>
						new TransactionError(
							`'${error.dataPath}' ${error.message}`,
							tx.id,
							error.dataPath,
						),
			  )
			: [];
		if (!typeValid) {
			throw new TransactionMultiError('Invalid field types', tx.id, errors);
		}
		this.asset = tx.asset as InTransferAsset;
	}

	protected assetToBytes(): Buffer {
		return Buffer.from(this.asset.inTransfer.dappId, 'utf8');
	}

	public assetToJSON(): object {
		return {
			...this.asset,
		};
	}

	// tslint:disable-next-line prefer-function-over-method
	protected verifyAgainstTransactions(
		_: ReadonlyArray<TransactionJSON>,
	): ReadonlyArray<TransactionError> {
		return [];
	}

	protected validateAsset(): ReadonlyArray<TransactionError> {
		validator.validate(inTransferAssetFormatSchema, this.asset);
		const errors = validator.errors
			? validator.errors.map(
					error =>
						new TransactionError(
							`'${error.dataPath}' ${error.message}`,
							this.id,
							error.dataPath,
						),
			  )
			: [];

		if (this.type !== TRANSACTION_INTRANSFER_TYPE) {
			errors.push(new TransactionError('Invalid type', this.id, '.type'));
		}

		// Per current protocol, this recipientId and recipientPublicKey must be empty
		if (this.recipientId) {
			errors.push(
				new TransactionError(
					'Recipient id must be empty',
					this.id,
					'.recipientId',
				),
			);
		}

		if (this.recipientPublicKey) {
			errors.push(
				new TransactionError(
					'Recipient public key must be empty',
					this.id,
					'.recipientPublicKey',
				),
			);
		}

		if (this.amount.lte(0)) {
			errors.push(
				new TransactionError(
					'Amount must be greater than 0',
					this.id,
					'.amount',
				),
			);
		}

		if (!this.fee.eq(IN_TRANSFER_FEE)) {
			errors.push(
				new TransactionError(
					`Fee must be equal to ${IN_TRANSFER_FEE}`,
					this.id,
					'.fee',
				),
			);
		}

		return errors;
	}

	protected async applyAsset(
		store: StateStore,
	): Promise<ReadonlyArray<TransactionError>> {
		const errors: TransactionError[] = [];
		const dappTx = await store.get<TransactionJSON>(
			ENTITY_TRANSACTION,
			this.asset.inTransfer.dappId,
		);
		const idExists = dappTx && dappTx.type === TRANSACTION_DAPP_TYPE;

		if (!idExists) {
			errors.push(
				new TransactionError(
					`Application not found: ${this.asset.inTransfer.dappId}`,
					this.id,
				),
			);
		}
		const sender = await store.get<Account>(ENTITY_ACCOUNT, this.senderId);

		const balanceError = verifyAmountBalance(
			this.id,
			sender,
			this.amount,
			this.fee,
		);
		if (balanceError) {
			errors.push(balanceError);
		}

		const updatedBalance = new BigNum(sender.balance).sub(this.amount);

		const updatedSender = { ...sender, balance: updatedBalance.toString() };

		await store.set(ENTITY_ACCOUNT, updatedSender.address, updatedSender);

		const recipient = await store.get<Account>(
			ENTITY_ACCOUNT,
			dappTx.senderId as string,
		);

		const updatedRecipientBalance = new BigNum(recipient.balance).add(
			this.amount,
		);
		const updatedRecipient = {
			...recipient,
			balance: updatedRecipientBalance.toString(),
		};

		await store.set(ENTITY_ACCOUNT, updatedRecipient.address, updatedRecipient);

		return errors;
	}

	protected async undoAsset(
		store: StateStore,
	): Promise<ReadonlyArray<TransactionError>> {
		const errors = [];
		const sender = await store.get<Account>(ENTITY_ACCOUNT, this.senderId);
		const updatedBalance = new BigNum(sender.balance).add(this.amount);
		const updatedSender = { ...sender, balance: updatedBalance.toString() };

		await store.set(ENTITY_ACCOUNT, updatedSender.address, updatedSender);

		const dappTransaction = await store.get<TransactionJSON>(
			ENTITY_TRANSACTION,
			this.asset.inTransfer.dappId,
		);

		const recipient = await store.get<Account>(
			ENTITY_ACCOUNT,
			dappTransaction.senderId as string,
		);

		const updatedRecipientBalance = new BigNum(recipient.balance).sub(
			this.amount,
		);

		if (updatedRecipientBalance.lt(0)) {
			errors.push(
				new TransactionError(
					`Account does not have enough LSK: ${
						recipient.address
					}, balance: ${convertBeddowsToLSK(recipient.balance)}.`,
					this.id,
				),
			);
		}
		const updatedRecipient = {
			...recipient,
			balance: updatedRecipientBalance.toString(),
		};

		await store.set(ENTITY_ACCOUNT, updatedRecipient.address, updatedRecipient);

		return errors;
	}
}
