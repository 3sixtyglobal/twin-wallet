// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntitySchemaFactory, EntitySchemaHelper } from "@3sixty/entity";
import { nameof } from "@3sixty/nameof";
import { WalletAddress } from "./entities/walletAddress.js";

/**
 * Initialize the schema for the wallet entity storage connector.
 */
export function initSchema(): void {
	EntitySchemaFactory.register(nameof<WalletAddress>(), () =>
		EntitySchemaHelper.getSchema(WalletAddress)
	);
}
