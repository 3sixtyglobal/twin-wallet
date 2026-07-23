// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseError, Is } from "@twin.org/core";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import {
	EntityStorageVaultConnector,
	type VaultKey,
	type VaultSecret
} from "@twin.org/vault-connector-entity-storage";
import { VaultConnectorFactory } from "@twin.org/vault-models";
import { FaucetConnectorFactory } from "@twin.org/wallet-models";
import {
	TEST_CLIENT_OPTIONS,
	TEST_COIN_TYPE,
	TEST_FAUCET_ENDPOINT,
	TEST_GAS_STATION_AUTH_TOKEN,
	TEST_GAS_STATION_ENDPOINT,
	TEST_MNEMONIC_NAME,
	TEST_NETWORK
} from "./setupTestEnv.js";
import { IotaFaucetConnector } from "../src/iotaFaucetConnector.js";
import { IotaWalletConnector } from "../src/iotaWalletConnector.js";
import type { IIotaFaucetConnectorConfig } from "../src/models/IIotaFaucetConnectorConfig.js";
import type { IIotaWalletConnectorConfig } from "../src/models/IIotaWalletConnectorConfig.js";

/**
 * Test Identity.
 */
const TEST_IDENTITY = "test-gas-station-identity";

/**
 * Test wallet connector.
 */
let walletConnector: IotaWalletConnector;

/**
 * Set up the test environment.
 */
beforeAll(async () => {
	// Setup entity storage and vault connectors
	EntityStorageConnectorFactory.register(
		"vault-key",
		() =>
			new MemoryEntityStorageConnector<VaultKey>({
				entitySchema: nameof<VaultKey>(),
				config: { storageKey: "vault-key" }
			})
	);

	const secretEntityStorage = new MemoryEntityStorageConnector<VaultSecret>({
		entitySchema: nameof<VaultSecret>(),
		config: { storageKey: "vault-secret" }
	});
	EntityStorageConnectorFactory.register("vault-secret", () => secretEntityStorage);
	VaultConnectorFactory.register("vault", () => new EntityStorageVaultConnector());

	// Setup faucet connector for funding
	const faucetConfig: IIotaFaucetConnectorConfig = {
		clientOptions: TEST_CLIENT_OPTIONS,
		endpoint: TEST_FAUCET_ENDPOINT,
		network: TEST_NETWORK,
		coinType: TEST_COIN_TYPE
	};

	FaucetConnectorFactory.register(
		"faucet",
		() => new IotaFaucetConnector({ config: faucetConfig })
	);

	// Configure for testnet with gas station
	const gasStationConfig: IIotaWalletConnectorConfig = {
		clientOptions: TEST_CLIENT_OPTIONS,
		network: TEST_NETWORK,
		vaultMnemonicId: TEST_MNEMONIC_NAME,
		vaultSeedId: "test-seed-gas-station",
		coinType: TEST_COIN_TYPE,
		gasStation: {
			gasStationUrl: TEST_GAS_STATION_ENDPOINT,
			gasStationAuthToken: TEST_GAS_STATION_AUTH_TOKEN
		}
	};

	walletConnector = new IotaWalletConnector({
		config: gasStationConfig
	});

	await walletConnector.create(TEST_IDENTITY);
});

describe("IotaWalletConnector Gas Station Tests", () => {
	test("should have gas station configuration", () => {
		expect(TEST_GAS_STATION_ENDPOINT).toBeDefined();
		expect(TEST_GAS_STATION_AUTH_TOKEN).toBeDefined();
	});

	test("can get addresses with gas station config", async () => {
		const addresses = await walletConnector.getAddresses(TEST_IDENTITY, 0, 0, 5);
		expect(addresses).toBeDefined();
		expect(addresses.length).toBe(5);
		expect(addresses[0]).toMatch(/^0x[\dA-Fa-f]+$/);
	});

	test("can get balance for address", async () => {
		const addresses = await walletConnector.getAddresses(TEST_IDENTITY, 0, 0, 1);
		const balance = await walletConnector.getBalance(TEST_IDENTITY, addresses[0]);
		expect(balance).toBeGreaterThanOrEqual(0n);
	});

	test.skipIf(!Is.stringValue(TEST_FAUCET_ENDPOINT))(
		"can ensure balance with faucet funding while gas station is configured",
		async () => {
			const addresses = await walletConnector.getAddresses(TEST_IDENTITY, 0, 0, 1);
			const address = addresses[0];

			const initialBalance = await walletConnector.getBalance(TEST_IDENTITY, address);

			// Ensure a higher balance (should trigger faucet funding)
			// Note: Gas station is for sponsoring transaction fees, not for funding addresses
			const targetBalance = initialBalance + 1000000000n; // 1 IOTA

			// This test verifies that ensureBalance works correctly with gas station configuration
			// The funding should come from the faucet, not the gas station
			try {
				await walletConnector.ensureBalance(TEST_IDENTITY, address, targetBalance, 30);

				const finalBalance = await walletConnector.getBalance(TEST_IDENTITY, address);
				expect(finalBalance).toBeGreaterThanOrEqual(targetBalance);
			} catch (error) {
				const message = BaseError.fromError(error).message;
				if (message === "iota.faucetRateLimit" || message === "iota.fundingFailed") {
					console.warn(
						"Faucet rate limit exceeded or funding failed, skipping test that requires funding from faucet."
					);
				} else {
					throw error;
				}
			}
		}
	);
});
