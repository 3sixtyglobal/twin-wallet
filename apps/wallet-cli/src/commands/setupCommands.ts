// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import {
	EntityStorageVaultConnector,
	type VaultKey,
	type VaultSecret,
	initSchema
} from "@twin.org/vault-connector-entity-storage";
import { VaultConnectorFactory } from "@twin.org/vault-models";
import { IotaFaucetConnector, IotaWalletConnector } from "@twin.org/wallet-connector-iota";
import type { IFaucetConnector, IWalletConnector } from "@twin.org/wallet-models";
import type { WalletConnectorTypes } from "../models/walletConnectorTypes.js";

/**
 * Setup the vault for use in the CLI commands.
 */
export function setupVault(): void {
	initSchema();

	EntityStorageConnectorFactory.register(
		"vault-key",
		() =>
			new MemoryEntityStorageConnector<VaultKey>({
				entitySchema: nameof<VaultKey>()
			})
	);
	EntityStorageConnectorFactory.register(
		"vault-secret",
		() =>
			new MemoryEntityStorageConnector<VaultSecret>({
				entitySchema: nameof<VaultSecret>()
			})
	);

	const vaultConnector = new EntityStorageVaultConnector();
	VaultConnectorFactory.register("vault", () => vaultConnector);
}

/**
 * Setup the wallet connector for use in the CLI commands.
 * @param options The options for the wallet connector.
 * @param options.nodeEndpoint The node endpoint.
 * @param options.network The network.
 * @param options.vaultSeedId The vault seed ID.
 * @param connector The connector to use.
 * @returns The wallet connector.
 */
export function setupWalletConnector(
	options: { nodeEndpoint: string; network?: string; vaultSeedId?: string },
	connector?: WalletConnectorTypes
): IWalletConnector {
	return new IotaWalletConnector({
		config: {
			clientOptions: {
				url: options.nodeEndpoint
			},
			network: options.network ?? "",
			vaultSeedId: options.vaultSeedId
		}
	});
}

/**
 * Setup the faucet connector for use in the CLI commands.
 * @param options The options for the wallet connector.
 * @param options.nodeEndpoint The node endpoint.
 * @param options.network The network.
 * @param options.vaultSeedId The vault seed ID.
 * @param options.endpoint The faucet endpoint.
 * @param connector The connector to use.
 * @returns The faucet connector.
 */
export function setupFaucetConnector(
	options: { nodeEndpoint: string; network?: string; endpoint: string; vaultSeedId?: string },
	connector?: WalletConnectorTypes
): IFaucetConnector {
	return new IotaFaucetConnector({
		config: {
			clientOptions: {
				url: options.nodeEndpoint
			},
			endpoint: options.endpoint,
			network: options.network ?? "",
			vaultSeedId: options.vaultSeedId
		}
	});
}
