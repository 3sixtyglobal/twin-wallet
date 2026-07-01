// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { Guards, Is } from "@twin.org/core";
import { Bip39 } from "@twin.org/crypto";
import { Iota } from "@twin.org/dlt-iota";
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
import { FaucetConnectorFactory } from "@twin.org/wallet-models";
import dotenv from "dotenv";
import { IotaFaucetConnector } from "../src/iotaFaucetConnector.js";
import { IotaWalletConnector } from "../src/iotaWalletConnector.js";
import type { IIotaFaucetConnectorConfig } from "../src/models/IIotaFaucetConnectorConfig.js";

console.debug("Setting up test environment from .env and .env.dev files");

dotenv.config({
	path: [path.join(__dirname, ".env.dev"), path.join(__dirname, ".env")],
	quiet: true
});

// Validate required environment variables
Guards.stringValue("TestEnv", "TEST_NODE_ENDPOINT", process.env.TEST_NODE_ENDPOINT);
Guards.stringValue("TestEnv", "TEST_FAUCET_ENDPOINT", process.env.TEST_FAUCET_ENDPOINT);
Guards.stringValue("TestEnv", "TEST_COIN_TYPE", process.env.TEST_COIN_TYPE);
Guards.stringValue("TestEnv", "TEST_EXPLORER_URL", process.env.TEST_EXPLORER_URL);
Guards.stringValue("TestEnv", "TEST_NETWORK", process.env.TEST_NETWORK);
Guards.stringValue("TestEnv", "TEST_GAS_STATION_ENDPOINT", process.env.TEST_GAS_STATION_ENDPOINT);
Guards.stringValue(
	"TestEnv",
	"TEST_GAS_STATION_AUTH_TOKEN",
	process.env.TEST_GAS_STATION_AUTH_TOKEN
);

if (!Is.stringValue(process.env.TEST_MNEMONIC)) {
	throw new Error(
		`Please define TEST_MNEMONIC as a 24 word mnemonic either as an environment variable or inside an .env.dev file
         e.g. TEST_MNEMONIC="word0 word1 ... word23"
         You can generate one using the following command
         npx "@twin.org/crypto-cli" mnemonic --env ./tests/.env.dev --env-prefix TEST_`
	);
}

export const TEST_IDENTITY_ID = "test-identity";
export const TEST_MNEMONIC_NAME = "test-mnemonic";

export const TEST_CLIENT_OPTIONS = {
	url: process.env.TEST_NODE_ENDPOINT
};

export const TEST_MNEMONIC = process.env.TEST_MNEMONIC;
export const TEST_NETWORK = process.env.TEST_NETWORK;
export const TEST_FAUCET_ENDPOINT = process.env.TEST_FAUCET_ENDPOINT;
export const TEST_SEED = Bip39.mnemonicToSeed(process.env.TEST_MNEMONIC);
export const TEST_COIN_TYPE = Number.parseInt(process.env.TEST_COIN_TYPE, 10);
export const TEST_GAS_STATION_ENDPOINT = process.env.TEST_GAS_STATION_ENDPOINT;
export const TEST_GAS_STATION_AUTH_TOKEN = process.env.TEST_GAS_STATION_AUTH_TOKEN;

const config: IIotaFaucetConnectorConfig = {
	clientOptions: TEST_CLIENT_OPTIONS,
	endpoint: process.env.TEST_FAUCET_ENDPOINT ?? "",
	network: TEST_NETWORK,
	coinType: TEST_COIN_TYPE
};

// Register faucet connector
FaucetConnectorFactory.register(
	"faucet",
	() =>
		new IotaFaucetConnector({
			config
		})
);

// Initialize schema for entity storage
initSchema();

// Setup entity storage connectors
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

const vaultConnector = new EntityStorageVaultConnector();
VaultConnectorFactory.register("vault", () => vaultConnector);

export let TEST_ADDRESS: string;

// Register test wallet
const TEST_WALLET_CONNECTOR = new IotaWalletConnector({
	config: {
		clientOptions: TEST_CLIENT_OPTIONS,
		network: TEST_NETWORK,
		vaultMnemonicId: TEST_MNEMONIC_NAME,
		coinType: TEST_COIN_TYPE
	}
});

/**
 * Setup the test environment.
 */
export async function setupTestEnv(): Promise<void> {
	console.debug(
		"Wallet Address",
		`${process.env.TEST_EXPLORER_URL}address/${TEST_ADDRESS}?network=${TEST_NETWORK}`
	);

	await vaultConnector.setSecret(`${TEST_IDENTITY_ID}/${TEST_MNEMONIC_NAME}`, TEST_MNEMONIC);

	const addresses = await Iota.getAddresses(
		vaultConnector,
		{
			...config,
			vaultMnemonicId: TEST_MNEMONIC_NAME
		},
		TEST_IDENTITY_ID,
		0,
		0,
		1
	);
	TEST_ADDRESS = addresses[0];

	await TEST_WALLET_CONNECTOR.ensureBalance(TEST_IDENTITY_ID, TEST_ADDRESS, 1000000000n);
}
