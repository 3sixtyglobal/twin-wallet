// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IIotaWalletConnectorConfig } from "./IIotaWalletConnectorConfig.js";

/**
 * Options for the IOTA Wallet connector.
 */
export interface IIotaWalletConnectorConstructorOptions {
	/**
	 * Optional vault connector to use for wallet secrets.
	 */
	vaultConnectorType?: string;

	/**
	 * Optional faucet connector for requesting funds.
	 */
	faucetConnectorType?: string;

	/**
	 * The configuration for the connector.
	 */
	config: IIotaWalletConnectorConfig;
}
