// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property } from "@3sixty/entity";

/**
 * Class describing a wallet address.
 */
@entity()
export class WalletAddress {
	/**
	 * The address in the wallet.
	 */
	@property({ type: "string", isPrimary: true })
	public address!: string;

	/**
	 * The identity of the owner.
	 */
	@property({ type: "string" })
	public identity!: string;

	/**
	 * The balance of the wallet as bigint.
	 */
	@property({ type: "string" })
	public balance!: string;
}
