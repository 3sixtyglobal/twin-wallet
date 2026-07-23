// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Ed25519Keypair } from "@iota/iota-sdk/keypairs/ed25519";
import { Is, BaseError } from "@twin.org/core";
import {
	TEST_CLIENT_OPTIONS,
	TEST_FAUCET_ENDPOINT,
	TEST_IDENTITY_ID,
	TEST_MNEMONIC,
	TEST_NETWORK,
	setupTestEnv
} from "./setupTestEnv.js";
import { IotaFaucetConnector } from "../src/iotaFaucetConnector.js";
import type { IIotaFaucetConnectorConfig } from "../src/models/IIotaFaucetConnectorConfig.js";

describe("IotaFaucetConnector", () => {
	beforeAll(async () => {
		await setupTestEnv();
	});

	test("can fail to construct a faucet with no options", () => {
		expect(
			() => new IotaFaucetConnector(undefined as unknown as { config: IIotaFaucetConnectorConfig })
		).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.objectUndefined",
				properties: {
					property: "options",
					value: "undefined"
				}
			})
		);
	});

	test("can fail to construct a faucet with no config", () => {
		expect(
			() => new IotaFaucetConnector({} as unknown as { config: IIotaFaucetConnectorConfig })
		).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.objectUndefined",
				properties: {
					property: "options.config",
					value: "undefined"
				}
			})
		);
	});

	test("can fail to construct a faucet with no config client options", () => {
		expect(
			() =>
				new IotaFaucetConnector({ config: {} } as unknown as {
					config: IIotaFaucetConnectorConfig;
				})
		).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.objectUndefined",
				properties: {
					property: "options.config.clientOptions",
					value: "undefined"
				}
			})
		);
	});

	test("can fail to construct a faucet with no endpoint", () => {
		expect(
			() =>
				new IotaFaucetConnector({ config: { clientOptions: {} } } as unknown as {
					config: IIotaFaucetConnectorConfig;
				})
		).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.string",
				properties: {
					property: "options.config.endpoint",
					value: "undefined"
				}
			})
		);
	});

	test("can construct a faucet with details", () => {
		const faucet = new IotaFaucetConnector({
			config: {
				clientOptions: TEST_CLIENT_OPTIONS,
				network: TEST_NETWORK,
				endpoint: TEST_FAUCET_ENDPOINT
			}
		});
		expect(faucet).toBeDefined();
	});

	test.skipIf(!Is.stringValue(TEST_FAUCET_ENDPOINT))(
		"can fund an address from the faucet",
		async () => {
			const keypair = Ed25519Keypair.deriveKeypair(TEST_MNEMONIC);
			const address = keypair.getPublicKey().toIotaAddress();

			const faucet = new IotaFaucetConnector({
				config: {
					clientOptions: TEST_CLIENT_OPTIONS,
					network: TEST_NETWORK,
					endpoint: TEST_FAUCET_ENDPOINT ?? ""
				}
			});

			try {
				const amountAdded = await faucet.fundAddress(TEST_IDENTITY_ID, address);
				expect(amountAdded).toBeGreaterThan(0n);
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
