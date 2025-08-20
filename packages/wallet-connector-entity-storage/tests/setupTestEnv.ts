// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
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
import * as dotenv from "dotenv";

console.debug("Setting up test environment from .env and .env.dev files");

dotenv.config({
	path: [path.join(__dirname, ".env"), path.join(__dirname, ".env.dev")],
	quiet: true
});

export const TEST_IDENTITY_ID = "test-identity";
export const TEST_IDENTITY_ID_2 = "test-identity-2";

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

VaultConnectorFactory.register("vault", () => new EntityStorageVaultConnector());
