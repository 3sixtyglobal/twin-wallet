// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HealthCategory,
	HealthStatus,
	type HealthApplicationCallback,
	type IHealth,
	type IHealthProviderComponent
} from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore, type IContextIds } from "@twin.org/context";
import { BaseError, GeneralError, Guards, Is, RandomHelper } from "@twin.org/core";
import { AccountHelper } from "@twin.org/dlt-account";
import { Iota } from "@twin.org/dlt-iota";
import { nameof } from "@twin.org/nameof";
import { VaultConnectorFactory, type IVaultConnector } from "@twin.org/vault-models";
import {
	FaucetConnectorFactory,
	type IFaucetConnector,
	type IWalletConnector
} from "@twin.org/wallet-models";
import type { IIotaWalletConnectorConfig } from "./models/IIotaWalletConnectorConfig.js";
import type { IIotaWalletConnectorConstructorOptions } from "./models/IIotaWalletConnectorConstructorOptions.js";

/**
 * Class for performing wallet operations on IOTA.
 */
export class IotaWalletConnector implements IWalletConnector, IHealthProviderComponent {
	/**
	 * The namespace supported by the wallet connector.
	 */
	public static readonly NAMESPACE: string = "iota";

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<IotaWalletConnector>();

	/**
	 * The configuration to use for IOTA operations.
	 * @internal
	 */
	private readonly _config: IIotaWalletConnectorConfig;

	/**
	 * The vault for the mnemonic or seed.
	 * @internal
	 */
	private readonly _vaultConnector: IVaultConnector;

	/**
	 * The IOTA faucet.
	 * @internal
	 */
	private readonly _faucetConnector?: IFaucetConnector;

	/**
	 * The IOTA client.
	 * @internal
	 */
	private readonly _client: ReturnType<typeof Iota.createClient>;

	/**
	 * The temporary identity created during health init, kept for teardown cleanup.
	 * @internal
	 */
	private _healthTempId?: string;

	/**
	 * Create a new instance of IOTA Wallet Connector.
	 * @param options The options for the wallet connector.
	 */
	constructor(options: IIotaWalletConnectorConstructorOptions) {
		Guards.object(IotaWalletConnector.CLASS_NAME, nameof(options), options);
		Guards.object<IIotaWalletConnectorConfig>(
			IotaWalletConnector.CLASS_NAME,
			nameof(options.config),
			options.config
		);

		this._vaultConnector = VaultConnectorFactory.get(options?.vaultConnectorType ?? "vault");
		this._faucetConnector = FaucetConnectorFactory.getIfExists(
			options?.faucetConnectorType ?? "faucet"
		);
		this._config = options.config;
		Iota.populateConfig(this._config);
		this._client = Iota.createClient(this._config);
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return IotaWalletConnector.CLASS_NAME;
	}

	/**
	 * Initialize the application health processing for a component.
	 * @param contextIds The context IDs provisioned during the init pass.
	 * @returns A promise that resolves when the initialization is complete.
	 */
	public async healthApplicationInit(contextIds: IContextIds): Promise<void> {
		const tempId = `did:temp:${RandomHelper.generateUuidV7()}`;
		this._healthTempId = tempId;
		try {
			// We create a temporary identity and store a mnemonic for it in the vault to
			// for the identity create to have a known controller
			await AccountHelper.createAccountKeys(undefined, this._vaultConnector, tempId);
		} catch {}
		contextIds[ContextIdKeys.Organization] = tempId;
	}

	/**
	 * Returns the application health status of the component.
	 * @param callback The callback to invoke when a deferred health result is ready.
	 * @returns The health status of the component.
	 */
	public async healthApplication(
		callback: HealthApplicationCallback
	): Promise<IHealth[] | undefined> {
		const contextIds = (await ContextIdStore.getContextIds()) ?? {};
		const orgId = contextIds[ContextIdKeys.Organization];

		if (Is.stringValue(orgId)) {
			try {
				if (!Is.undefined(this._faucetConnector)) {
					const address = await AccountHelper.getAddress(
						this._config,
						this._vaultConnector,
						orgId,
						0,
						0
					);
					await this._faucetConnector.fundAddress(orgId, address);

					return [
						{
							source: IotaWalletConnector.CLASS_NAME,
							category: HealthCategory.Application,
							status: HealthStatus.Ok,
							description: "healthDescription",
							message: "fundFromFaucet",
							data: {
								address
							}
						}
					];
				}

				return [
					{
						source: IotaWalletConnector.CLASS_NAME,
						category: HealthCategory.Application,
						status: HealthStatus.Ok,
						description: "healthDescription",
						message: "healthNoFaucet"
					}
				];
			} catch (err) {
				return [
					{
						source: IotaWalletConnector.CLASS_NAME,
						category: HealthCategory.Application,
						status: HealthStatus.Error,
						description: "healthDescription",
						message: "fundWalletFailed",
						error: BaseError.fromError(err)
					}
				];
			}
		}

		return [];
	}

	/**
	 * Teardown the application health processing for a component.
	 * @returns A promise that resolves when the teardown is complete.
	 */
	public async healthApplicationTeardown(): Promise<void> {
		const contextIds = (await ContextIdStore.getContextIds()) ?? {};
		const orgId = contextIds[ContextIdKeys.Organization];

		if (Is.stringValue(orgId)) {
			await AccountHelper.removeAccountKeys(undefined, this._vaultConnector, orgId);
		}

		if (Is.stringValue(this._healthTempId) && this._healthTempId !== orgId) {
			await AccountHelper.removeAccountKeys(undefined, this._vaultConnector, this._healthTempId);
		}

		this._healthTempId = undefined;
	}

	/**
	 * Create a new wallet.
	 * @param identity The identity of the user to access the vault keys.
	 * @returns A promise that resolves when the wallet has been created and the mnemonic stored.
	 */
	public async create(identity: string): Promise<void> {
		Guards.stringValue(IotaWalletConnector.CLASS_NAME, nameof(identity), identity);
		await AccountHelper.createAccountKeys(
			this._config,
			this._vaultConnector,
			identity,
			undefined,
			0
		);
	}

	/**
	 * Get the addresses for the identity.
	 * @param identity The identity to get the addresses for.
	 * @param accountIndex The account index to get the addresses for.
	 * @param startAddressIndex The start index for the addresses.
	 * @param count The number of addresses to generate.
	 * @param isInternal Whether the addresses are internal.
	 * @returns The addresses.
	 */
	public async getAddresses(
		identity: string,
		accountIndex: number,
		startAddressIndex: number,
		count: number,
		isInternal?: boolean
	): Promise<string[]> {
		Guards.stringValue(IotaWalletConnector.CLASS_NAME, nameof(identity), identity);

		return AccountHelper.getAddresses(
			this._config,
			this._vaultConnector,
			identity,
			accountIndex,
			startAddressIndex,
			count,
			isInternal
		);
	}

	/**
	 * Get the balance for the given address.
	 * @param identity The identity of the user to access the vault keys.
	 * @param address The address to get the balance for.
	 * @returns The balance.
	 */
	public async getBalance(identity: string, address: string): Promise<bigint> {
		Guards.stringValue(IotaWalletConnector.CLASS_NAME, nameof(identity), identity);
		Guards.stringValue(IotaWalletConnector.CLASS_NAME, nameof(address), address);

		const balance = await this._client.getBalance({
			owner: address
		});

		return BigInt(balance.totalBalance);
	}

	/**
	 * Ensure the balance for the given address is at least the given amount.
	 * @param identity The identity of the user to access the vault keys.
	 * @param address The address to ensure the balance for.
	 * @param ensureBalance The minimum balance to ensure.
	 * @param timeoutInSeconds Optional timeout in seconds, defaults to 10 seconds.
	 * @returns True if the balance is at least the given amount, false otherwise.
	 */
	public async ensureBalance(
		identity: string,
		address: string,
		ensureBalance: bigint,
		timeoutInSeconds?: number
	): Promise<boolean> {
		Guards.stringValue(IotaWalletConnector.CLASS_NAME, nameof(identity), identity);
		Guards.stringValue(IotaWalletConnector.CLASS_NAME, nameof(address), address);
		Guards.bigint(IotaWalletConnector.CLASS_NAME, nameof(ensureBalance), ensureBalance);

		let currentBalance = await this.getBalance(identity, address);

		if (this._faucetConnector) {
			let retryCount = 10;

			while (currentBalance < ensureBalance && retryCount > 0) {
				const addedBalance = await this._faucetConnector.fundAddress(
					identity,
					address,
					timeoutInSeconds
				);
				if (addedBalance === 0n) {
					return false;
				}
				currentBalance += addedBalance;
				if (currentBalance < ensureBalance) {
					await new Promise(resolve => setTimeout(resolve, 1000));
					retryCount--;
				}
			}
		}

		return currentBalance >= ensureBalance;
	}

	/**
	 * Transfer an amount from one address to another.
	 * @param identity The identity of the user to access the vault keys.
	 * @param addressSource The source address to transfer from.
	 * @param addressDest The destination address to transfer to.
	 * @param amount The amount to transfer.
	 * @returns The transaction digest.
	 */
	public async transfer(
		identity: string,
		addressSource: string,
		addressDest: string,
		amount: bigint
	): Promise<string | undefined> {
		Guards.stringValue(IotaWalletConnector.CLASS_NAME, nameof(identity), identity);
		Guards.stringValue(IotaWalletConnector.CLASS_NAME, nameof(addressSource), addressSource);
		Guards.stringValue(IotaWalletConnector.CLASS_NAME, nameof(addressDest), addressDest);
		Guards.bigint(IotaWalletConnector.CLASS_NAME, nameof(amount), amount);

		try {
			const result = await Iota.prepareAndPostValueTransaction(
				this._config,
				this._vaultConnector,
				undefined,
				identity,
				this._client,
				addressSource,
				amount,
				addressDest
			);

			return result.digest;
		} catch (error) {
			throw new GeneralError(
				IotaWalletConnector.CLASS_NAME,
				"transferFailed",
				undefined,
				Iota.extractPayloadError(error)
			);
		}
	}
}
