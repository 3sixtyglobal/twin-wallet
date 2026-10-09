// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { MemoryEntityStorageConnector } from "@3sixty/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@3sixty/entity-storage-models";
import { nameof } from "@3sixty/nameof";
import {
	EntityStorageVaultConnector,
	type VaultKey,
	type VaultSecret,
	initSchema
} from "@3sixty/vault-connector-entity-storage";
import { VaultConnectorFactory } from "@3sixty/vault-models";
import { IotaFaucetConnector, IotaWalletConnector } from "@3sixty/wallet-connector-iota";
import type { IFaucetConnector, IWalletConnector } from "@3sixty/wallet-models";
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
				entitySchema: nameof<VaultKey>(),
				config: { storageKey: "vault-key" }
			})
	);
	EntityStorageConnectorFactory.register(
		"vault-secret",
		() =>
			new MemoryEntityStorageConnector<VaultSecret>({
				entitySchema: nameof<VaultSecret>(),
				config: { storageKey: "vault-secret" }
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
