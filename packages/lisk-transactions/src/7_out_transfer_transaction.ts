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
import { MAX_TRANSACTION_AMOUNT, OUT_TRANSFER_FEE } from './constants';
import { TransactionError, TransactionMultiError } from './errors';
import { Account, TransactionJSON } from './transaction_types';
import { verifyAmountBalance } from './utils';
import { validator } from './utils/validation';

const TRANSACTION_OUTTRANSFER_TYPE = 7;

export interface OutTransferAsset {
	readonly outTransfer: {
		readonly dappId: string;
		readonly transactionId: string;
	};
}

export const outTransferAssetTypeSchema = {
	type: 'object',
	required: ['outTransfer'],
	properties: {
		outTransfer: {
			type: 'object',
			required: ['dappId', 'transactionId'],
			properties: {
				dappId: {
					type: 'string',
				},
				transactionId: {
					type: 'string',
				},
			},
		},
	},
};

export const outTransferAssetFormatSchema = {
	type: 'object',
	required: ['outTransfer'],
	properties: {
		outTransfer: {
			type: 'object',
			required: ['dappId', 'transactionId'],
			properties: {
				dappId: {
					type: 'string',
					format: 'id',
				},
				transactionId: {
					type: 'string',
					format: 'id',
				},
			},
		},
	},
};

export class OutTransferTransaction extends BaseTransaction {
	public readonly asset: OutTransferAsset;
	public readonly containsUniqueData: boolean;

	public constructor(tx: TransactionJSON) {
		super(tx);
		const typeValid = validator.validate(outTransferAssetTypeSchema, tx.asset);
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
		this.asset = tx.asset as OutTransferAsset;
		this.containsUniqueData = true;
	}

	protected assetToBytes(): Buffer {
		const { dappId, transactionId } = this.asset.outTransfer;
		const outAppIdBuffer = Buffer.from(dappId, 'utf8');
		const outTransactionIdBuffer = Buffer.from(transactionId, 'utf8');

		return Buffer.concat([outAppIdBuffer, outTransactionIdBuffer]);
	}

	public assetToJSON(): object {
		return {
			...this.asset,
		};
	}

	protected verifyAgainstTransactions(
		transactions: ReadonlyArray<TransactionJSON>,
	): ReadonlyArray<TransactionError> {
		const sameTypeTransactions = transactions.filter(
			tx =>
				tx.type === this.type &&
				'outTransfer' in tx.asset &&
				this.asset.outTransfer.transactionId ===
					(tx.asset as OutTransferAsset).outTransfer.transactionId,
		);

		return sameTypeTransactions.length > 0
			? [
					new TransactionError(
						'Out Transfer cannot refer to the same transactionId',
						this.id,
						'.asset.outTransfer.transactionId',
					),
			  ]
			: [];
	}

	protected validateAsset(): ReadonlyArray<TransactionError> {
		validator.validate(outTransferAssetFormatSchema, this.asset);
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

		if (this.type !== TRANSACTION_OUTTRANSFER_TYPE) {
			errors.push(new TransactionError('Invalid type', this.id, '.type'));
		}

		// Amount has to be greater than 0
		if (this.amount.lte(0)) {
			errors.push(
				new TransactionError(
					'Amount must be greater than zero for outTransfer transaction',
					this.id,
					'.amount',
				),
			);
		}

		if (!this.fee.eq(OUT_TRANSFER_FEE)) {
			errors.push(
				new TransactionError(
					'Amount must be set fee for outTransfer transaction',
					this.id,
					'.fee',
				),
			);
		}

		if (this.recipientId === '') {
			errors.push(
				new TransactionError(
					'RecipientId must be set for outTransfer transaction',
					this.id,
					'.recipientId',
				),
			);
		}

		const assetErrors = validator.errors
			? validator.errors.map(
					error =>
						new TransactionError(
							`'${error.dataPath}' ${error.message}`,
							this.id,
							error.dataPath,
						),
			  )
			: [];
		errors.push(...assetErrors);

		return errors;
	}

	protected async applyAsset(
		store: StateStore,
	): Promise<ReadonlyArray<TransactionError>> {
		const errors: TransactionError[] = [];
		const dappRegistrationTransaction = await store.get<TransactionJSON>(
			ENTITY_TRANSACTION,
			this.asset.outTransfer.dappId,
		);

		if (dappRegistrationTransaction.senderId !== this.senderId) {
			errors.push(
				new TransactionError(
					`Out transaction must be sent from owner of the Dapp.`,
					this.id,
				),
			);
		}

		const transactionExists = await store.exists(
			ENTITY_TRANSACTION,
			this.asset.outTransfer.transactionId,
		);
		if (transactionExists) {
			errors.push(
				new TransactionError(
					`Transaction ${
						this.asset.outTransfer.transactionId
					} is already processed.`,
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
			this.recipientId,
		);

		const updatedRecipientBalance = new BigNum(recipient.balance).add(
			this.amount,
		);

		if (updatedRecipientBalance.gt(MAX_TRANSACTION_AMOUNT)) {
			errors.push(new TransactionError('Invalid amount', this.id, '.amount'));
		}

		const updatedRecipient = {
			...recipient,
			balance: updatedRecipientBalance.toString(),
		};

		await store.set(ENTITY_ACCOUNT, updatedRecipient.address, updatedRecipient);

		return errors;
	}

	public async undoAsset(
		store: StateStore,
	): Promise<ReadonlyArray<TransactionError>> {
		const errors: TransactionError[] = [];
		const sender = await store.get<Account>(ENTITY_ACCOUNT, this.senderId);
		const updatedBalance = new BigNum(sender.balance).add(this.amount);

		if (updatedBalance.gt(MAX_TRANSACTION_AMOUNT)) {
			errors.push(new TransactionError('Invalid amount', this.id, '.amount'));
		}

		const updatedSender = { ...sender, balance: updatedBalance.toString() };
		await store.set(ENTITY_ACCOUNT, updatedSender.address, updatedSender);

		const recipient = await store.get<Account>(
			ENTITY_ACCOUNT,
			this.recipientId,
		);

		const updatedRecipientBalance = new BigNum(recipient.balance).sub(
			this.amount,
		);

		if (updatedRecipientBalance.lt(0)) {
			errors.push(
				new TransactionError(
					`Account does not have enough LSK: ${recipient.address}, balance: ${
						recipient.balance
					}`,
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
