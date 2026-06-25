// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the Entity Storage Wallet Connector.
 */
export interface IEntityStorageWalletConnectorConfig {
	/**
	 * The id of the entry in the vault containing the mnemonic.
	 * @default mnemonic
	 */
	vaultMnemonicId?: string;

	/**
	 * The coin type.
	 * @default 9999
	 */
	coinType?: number;

	/**
	 * The network name part for the addresses.
	 * @default ent
	 */
	networkName?: string;
}
