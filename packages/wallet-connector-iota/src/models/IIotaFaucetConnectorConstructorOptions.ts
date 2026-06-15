// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IIotaFaucetConnectorConfig } from "./IIotaFaucetConnectorConfig.js";

/**
 * Options for the IOTA Faucet Connector constructor.
 */
export interface IIotaFaucetConnectorConstructorOptions {
	/**
	 * The configuration for the connector.
	 */
	config: IIotaFaucetConnectorConfig;

	/**
	 * Vault connector to use for faucet secrets.
	 * @default vault
	 */
	vaultConnectorType?: string;
}
