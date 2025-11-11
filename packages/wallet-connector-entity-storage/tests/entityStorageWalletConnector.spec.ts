// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Bip39 } from "@twin.org/crypto";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import type { VaultSecret } from "@twin.org/vault-connector-entity-storage";
import { FaucetConnectorFactory } from "@twin.org/wallet-models";
import { TEST_IDENTITY_ID, TEST_IDENTITY_ID_2 } from "./setupTestEnv.js";
import type { WalletAddress } from "../src/entities/walletAddress.js";
import { EntityStorageFaucetConnector } from "../src/entityStorageFaucetConnector.js";
import { EntityStorageWalletConnector } from "../src/entityStorageWalletConnector.js";
import { initSchema } from "../src/schema.js";

let walletAddressEntityStorage: MemoryEntityStorageConnector<WalletAddress>;
let faucetConnector: EntityStorageFaucetConnector;

let testAddresses: string[] = [];

describe("EntityStorageWalletConnector", () => {
	beforeAll(() => {
		initSchema();

		Bip39.randomMnemonic = vi
			.fn()
			.mockImplementation(
				() =>
					"elder blur tip exact organ pipe other same minute grace conduct father brother prosper tide icon pony suggest joy provide dignity domain nominee liquid"
			);
	});

	beforeEach(() => {
		walletAddressEntityStorage = new MemoryEntityStorageConnector<WalletAddress>({
			entitySchema: nameof<WalletAddress>()
		});
		EntityStorageConnectorFactory.register("wallet-address", () => walletAddressEntityStorage);
		faucetConnector = new EntityStorageFaucetConnector();
		FaucetConnectorFactory.register("faucet", () => faucetConnector);
	});

	afterEach(() => {
		EntityStorageConnectorFactory.unregister("wallet-address");
	});

	test("can construct a wallet", () => {
		const faucet = new EntityStorageWalletConnector();
		expect(faucet).toBeDefined();
	});

	test("can create a new wallet", async () => {
		const wallet = new EntityStorageWalletConnector();

		await wallet.create(TEST_IDENTITY_ID);

		const store =
			EntityStorageConnectorFactory.get<MemoryEntityStorageConnector<VaultSecret>>(
				"vault-secret"
			).getStore();
		expect(store?.[0].id).toEqual(`${TEST_IDENTITY_ID}/mnemonic`);
		expect((store?.[0].data as string).split(" ").length).toEqual(24);
	});

	test("can generate addresses for the wallet", async () => {
		const wallet = new EntityStorageWalletConnector();

		testAddresses = await wallet.getAddresses(TEST_IDENTITY_ID, 0, 0, 10);
		expect(testAddresses.length).toEqual(10);
		expect(testAddresses).toEqual([
			"0xa7e00e1737a735e75297ab5b4211e18f0c4a1cd4987b9e86a94cf5c46204dfe9",
			"0x694a6b974ecb5ae6441aa349d267ff2feb6c790c3ae5a7c4b1434aedbee99675",
			"0x5ac962e71e55677793a8fd1e8194f6245a54819c6f510b669529569bc9498d6d",
			"0x5b36533e9d77fc1a1174d8007efc182632b033c14242421e62457846c488203e",
			"0xfdea4aae3b2f4ffbe1710f6a0ec15f7a23356397ab4c42a2825830c459f1eb0f",
			"0xdd08250b740988588521fd060d73dbbe06e45f02249469d2790ecbd98ae8e212",
			"0xbb7a14195fa00353b5ae54a370e64b2a9527e54e95315dfcadcac1e6a4cc0388",
			"0x5a0de4ff9b7a97679d7f15db5947fbda89974a8622da97ee556f09f83df7a100",
			"0x3abf2b91f90ea0abeb18955ee10fde937a953cf86cfe5ca23219b475932bd859",
			"0x0ca4c6975d97c116591d2fb84ed54cd4eacd236d2924c89f7c52f4236d43a9df"
		]);
	});

	test("can fail to ensure a balance on an address with no faucet available", async () => {
		FaucetConnectorFactory.unregister("faucet");
		const wallet = new EntityStorageWalletConnector();

		const ensured = await wallet.ensureBalance(
			TEST_IDENTITY_ID,
			testAddresses[0],
			1000000000n,
			undefined
		);
		expect(ensured).toBeFalsy();
	});

	test("can fail to ensure a balance with faucet depleted", async () => {
		FaucetConnectorFactory.register("faucet", () => ({
			CLASS_NAME: "foo",
			className: () => "foo",
			fundAddress: async (): Promise<bigint> => 0n
		}));
		const wallet = new EntityStorageWalletConnector();

		const ensured = await wallet.ensureBalance(TEST_IDENTITY_ID, testAddresses[0], 1000000000n);
		expect(ensured).toBeFalsy();
	});

	test("can ensure a balance on an address with retries", async () => {
		const wallet = new EntityStorageWalletConnector();

		const ensured = await wallet.ensureBalance(TEST_IDENTITY_ID, testAddresses[0], 2000000000n);

		expect(ensured).toBeTruthy();

		const store = walletAddressEntityStorage.getStore();
		expect(store?.[0].address).toEqual(testAddresses[0]);
		expect(store?.[0].balance).toEqual("2000000000");
	});

	test("can ensure a balance on an address", async () => {
		const wallet = new EntityStorageWalletConnector();

		const ensured = await wallet.ensureBalance(TEST_IDENTITY_ID, testAddresses[0], 1000000000n);

		expect(ensured).toBeTruthy();

		const store = walletAddressEntityStorage.getStore();
		expect(store?.[0].address).toEqual(testAddresses[0]);
		expect(store?.[0].balance).toEqual("1000000000");
		expect(store?.[0].identity).toEqual(TEST_IDENTITY_ID);
	});

	test("can get a balance for an address", async () => {
		await walletAddressEntityStorage.set({
			address: testAddresses[0],
			identity: TEST_IDENTITY_ID,
			balance: "1000000000"
		});

		const wallet = new EntityStorageWalletConnector();

		const balance = await wallet.getBalance(TEST_IDENTITY_ID, testAddresses[0]);

		expect(balance).toEqual(1000000000n);
	});

	test("can fail to transfer with insufficient funds", async () => {
		const wallet = new EntityStorageWalletConnector();

		await expect(wallet.transfer(TEST_IDENTITY_ID, "addr1", "addr2", 100n)).rejects.toMatchObject({
			name: "GeneralError",
			message: "entityStorageWalletConnector.insufficientFunds"
		});
	});

	test("can transfer to another address that does not exist", async () => {
		await walletAddressEntityStorage.set({
			address: testAddresses[0],
			identity: TEST_IDENTITY_ID,
			balance: "1"
		});
		await walletAddressEntityStorage.set({
			address: testAddresses[1],
			identity: TEST_IDENTITY_ID,
			balance: "1000000000"
		});

		const wallet = new EntityStorageWalletConnector();

		await wallet.transfer(TEST_IDENTITY_ID, testAddresses[1], testAddresses[2], 100n);

		const store = walletAddressEntityStorage.getStore();

		expect(store?.[0].address).toEqual(testAddresses[0]);
		expect(store?.[0].balance).toEqual("1");
		expect(store?.[0].identity).toEqual(TEST_IDENTITY_ID);

		expect(store?.[1].address).toEqual(testAddresses[1]);
		expect(store?.[1].balance).toEqual("999999900");
		expect(store?.[1].identity).toEqual(TEST_IDENTITY_ID);

		expect(store?.[2].address).toEqual(testAddresses[2]);
		expect(store?.[2].balance).toEqual("100");
		expect(store?.[2].identity).toEqual("");
	});

	test("can transfer to another address that exists", async () => {
		await walletAddressEntityStorage.set({
			address: testAddresses[0],
			identity: TEST_IDENTITY_ID,
			balance: "1"
		});
		await walletAddressEntityStorage.set({
			address: testAddresses[1],
			identity: TEST_IDENTITY_ID,
			balance: "1000000000"
		});
		await walletAddressEntityStorage.set({
			address: testAddresses[2],
			identity: TEST_IDENTITY_ID_2,
			balance: "500"
		});

		const wallet = new EntityStorageWalletConnector();

		await wallet.transfer(TEST_IDENTITY_ID, testAddresses[1], testAddresses[2], 100n);

		const store = walletAddressEntityStorage.getStore();

		expect(store?.[0].address).toEqual(testAddresses[0]);
		expect(store?.[0].balance).toEqual("1");
		expect(store?.[0].identity).toEqual(TEST_IDENTITY_ID);

		expect(store?.[1].address).toEqual(testAddresses[1]);
		expect(store?.[1].balance).toEqual("999999900");
		expect(store?.[1].identity).toEqual(TEST_IDENTITY_ID);

		expect(store?.[2].address).toEqual(testAddresses[2]);
		expect(store?.[2].balance).toEqual("600");
		expect(store?.[2].identity).toEqual("test-identity-2");
	});
});
