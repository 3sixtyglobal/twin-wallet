// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import type { WalletAddress } from "../src/entities/walletAddress.js";
import { EntityStorageFaucetConnector } from "../src/entityStorageFaucetConnector.js";
import { initSchema } from "../src/schema.js";

export const TEST_IDENTITY_ID = "test-identity";

let walletAddressEntityStorage: MemoryEntityStorageConnector<WalletAddress>;

describe("EntityStorageFaucetConnector", () => {
	beforeAll(() => {
		initSchema();
	});

	beforeEach(() => {
		walletAddressEntityStorage = new MemoryEntityStorageConnector<WalletAddress>({
			entitySchema: nameof<WalletAddress>()
		});
		EntityStorageConnectorFactory.register("wallet-address", () => walletAddressEntityStorage);
	});

	afterEach(async () => {
		await walletAddressEntityStorage.teardown();
		EntityStorageConnectorFactory.unregister("wallet-address");
	});

	test("can construct a faucet with details", () => {
		const faucet = new EntityStorageFaucetConnector();
		expect(faucet).toBeDefined();
	});

	test("can fund a non existent address from the faucet", async () => {
		const faucet = new EntityStorageFaucetConnector();

		const amountAdded = await faucet.fundAddress(TEST_IDENTITY_ID, "addr1");

		expect(amountAdded).toBeGreaterThan(0);

		const store = await walletAddressEntityStorage.getStore();
		expect(store?.[0].address).toEqual("addr1");
		expect(store?.[0].identity).toEqual(TEST_IDENTITY_ID);
		expect(store?.[0].balance).toEqual("1000000000");
	});

	test("can fund an existing address from the faucet", async () => {
		await walletAddressEntityStorage.set({
			address: "addr1",
			identity: TEST_IDENTITY_ID,
			balance: "1000"
		});

		const faucet = new EntityStorageFaucetConnector();

		const amountAdded = await faucet.fundAddress(TEST_IDENTITY_ID, "addr1");

		expect(amountAdded).toBeGreaterThan(0);

		const store = await walletAddressEntityStorage.getStore();
		expect(store?.[0].address).toEqual("addr1");
		expect(store?.[0].identity).toEqual(TEST_IDENTITY_ID);
		expect(store?.[0].balance).toEqual("1000001000");
	});
});
