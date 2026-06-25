// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { WalletConnectorFactory } from "../src/factories/walletConnectorFactory.js";
import type { IWalletConnector } from "../src/models/IWalletConnector.js";

describe("WalletConnectorFactory", () => {
	test("can add an item to the factory", async () => {
		WalletConnectorFactory.register("my-wallet", () => ({}) as unknown as IWalletConnector);
	});
});
