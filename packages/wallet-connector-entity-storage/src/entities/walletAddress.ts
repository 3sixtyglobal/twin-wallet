// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property } from "@twin.org/entity";

/**
 * Class describing a wallet address.
 */
@entity()
export class WalletAddress {
	/**
	 * The address in the wallet.
	 */
	@property({ type: "string", isPrimary: true, maxLength: 255 })
	public address!: string;

	/**
	 * The identity of the owner.
	 */
	@property({ type: "string", maxLength: 255 })
	public identity!: string;

	/**
	 * The balance of the wallet as bigint.
	 */
	@property({ type: "string", maxLength: 128 })
	public balance!: string;
}
