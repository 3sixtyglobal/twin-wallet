// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IEntityStorageWalletConnectorConfig } from "./IEntityStorageWalletConnectorConfig.js";

/**
 * Options for the entity storage wallet connector.
 */
export interface IEntityStorageWalletConnectorConstructorOptions {
	/**
	 * Vault connector to use for wallet secrets.
	 * @default vault
	 */
	vaultConnectorType?: string;

	/**
	 * Optional faucet for requesting funds.
	 * @default faucet
	 */
	faucetConnectorType?: string;

	/**
	 * The entity storage for wallets.
	 * @default wallet-address
	 */
	walletAddressEntityStorageType?: string;

	/**
	 * The configuration for the wallet connector.
	 */
	config?: IEntityStorageWalletConnectorConfig;
}
