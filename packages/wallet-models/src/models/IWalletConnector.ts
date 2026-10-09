// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@3sixty/core";

/**
 * Interface describing a wallet connector.
 */
export interface IWalletConnector extends IComponent {
	/**
	 * Create a new wallet.
	 * @param identity The identity of the user to access the vault keys.
	 * @returns A promise that resolves when the wallet has been created and the mnemonic stored.
	 */
	create(identity: string): Promise<void>;

	/**
	 * Get the addresses for the requested range.
	 * @param identity The identity of the user to access the vault keys.
	 * @param accountIndex The account index to get the addresses for.
	 * @param startAddressIndex The start index for the addresses.
	 * @param count The number of addresses to generate.
	 * @returns The list of addresses.
	 */
	getAddresses(
		identity: string,
		accountIndex: number,
		startAddressIndex: number,
		count: number
	): Promise<string[]>;

	/**
	 * Get the balance for an address in a wallet.
	 * @param identity The identity of the user to access the vault keys.
	 * @param address The hex encoded address.
	 * @returns The balance of the wallet address.
	 */
	getBalance(identity: string, address: string): Promise<bigint>;

	/**
	 * Ensure the balance for an address in a wallet.
	 * @param identity The identity of the user to access the vault keys.
	 * @param address The hex encoded address.
	 * @param ensureBalance The balance to ensure on the address.
	 * @param timeoutInSeconds The timeout in seconds to wait for the funding to complete.
	 * @returns True if the balance has been ensured.
	 */
	ensureBalance(
		identity: string,
		address: string,
		ensureBalance: bigint,
		timeoutInSeconds?: number
	): Promise<boolean>;

	/**
	 * Transfer funds to an address.
	 * @param identity The identity of the user to access the vault keys.
	 * @param addressSource The hex encoded address to send the funds from.
	 * @param addressDest The hex encoded address to send the funds to.
	 * @param amount The amount to transfer.
	 * @returns An identifier for the transfer if there was one.
	 */
	transfer(
		identity: string,
		addressSource: string,
		addressDest: string,
		amount: bigint
	): Promise<string | undefined>;
}
