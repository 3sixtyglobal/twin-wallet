// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Coerce, Guards, Is } from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import type { IFaucetConnector } from "@twin.org/wallet-models";
import type { WalletAddress } from "./entities/walletAddress";
import type { IEntityStorageFaucetConnectorConstructorOptions } from "./models/IEntityStorageFaucetConnectorConstructorOptions";

/**
 * Class for performing faucet operations using entity storage.
 */
export class EntityStorageFaucetConnector implements IFaucetConnector {
	/**
	 * The namespace supported by the wallet connector.
	 */
	public static readonly NAMESPACE: string = "entity-storage";

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<EntityStorageFaucetConnector>();

	/**
	 * The entity storage for wallets.
	 * @internal
	 */
	private readonly _walletAddressEntityStorage: IEntityStorageConnector<WalletAddress>;

	/**
	 * Create a new instance of EntityStorageFaucetConnector.
	 * @param options The options for the wallet connector.
	 */
	constructor(options?: IEntityStorageFaucetConnectorConstructorOptions) {
		this._walletAddressEntityStorage = EntityStorageConnectorFactory.get(
			options?.walletAddressEntityStorageType ?? "wallet-address"
		);
	}

	/**
	 * Fund the wallet from the faucet.
	 * @param identity The identity of the user to access the vault keys.
	 * @param address The hex encoded address of the address to fund.
	 * @param timeoutInSeconds The timeout in seconds to wait for the funding to complete.
	 * @returns The amount added to the address by the faucet.
	 */
	public async fundAddress(
		identity: string,
		address: string,
		timeoutInSeconds: number = 60
	): Promise<bigint> {
		Guards.stringValue(EntityStorageFaucetConnector.CLASS_NAME, nameof(identity), identity);
		Guards.stringValue(EntityStorageFaucetConnector.CLASS_NAME, nameof(address), address);

		let walletAddress = await this._walletAddressEntityStorage.get(address);
		if (Is.empty(walletAddress)) {
			walletAddress = {
				balance: "0",
				identity,
				address
			};
		}

		const maxFundAmount = 1000000000n;
		const balance = Coerce.bigint(walletAddress.balance) ?? 0n;
		walletAddress.balance = (balance + maxFundAmount).toString();

		await this._walletAddressEntityStorage.set(walletAddress);

		return maxFundAmount;
	}
}
