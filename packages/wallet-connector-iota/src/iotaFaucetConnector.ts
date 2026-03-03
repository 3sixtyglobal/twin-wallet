// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IotaClient } from "@iota/iota-sdk/client";
import { requestIotaFromFaucetV0 } from "@iota/iota-sdk/faucet";
import { GeneralError, Guards } from "@twin.org/core";
import { Iota } from "@twin.org/dlt-iota";
import { nameof } from "@twin.org/nameof";
import type { IFaucetConnector } from "@twin.org/wallet-models";
import type { IIotaFaucetConnectorConfig } from "./models/IIotaFaucetConnectorConfig.js";
import type { IIotaFaucetConnectorConstructorOptions } from "./models/IIotaFaucetConnectorConstructorOptions.js";

/**
 * Class for performing faucet operations on IOTA.
 */
export class IotaFaucetConnector implements IFaucetConnector {
	/**
	 * The namespace supported by the faucet connector.
	 */
	public static readonly NAMESPACE: string = "iota";

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<IotaFaucetConnector>();

	/**
	 * The configuration to use for IOTA operations.
	 * @internal
	 */
	private readonly _config: IIotaFaucetConnectorConfig;

	/**
	 * The IOTA client.
	 * @internal
	 */
	private readonly _client: IotaClient;

	/**
	 * Create a new instance of IotaFaucetConnector.
	 * @param options The options for the connector.
	 */
	constructor(options: IIotaFaucetConnectorConstructorOptions) {
		Guards.object(IotaFaucetConnector.CLASS_NAME, nameof(options), options);
		Guards.object<IIotaFaucetConnectorConfig>(
			IotaFaucetConnector.CLASS_NAME,
			nameof(options.config),
			options.config
		);
		Guards.object(
			IotaFaucetConnector.CLASS_NAME,
			nameof(options.config.clientOptions),
			options.config.clientOptions
		);
		Guards.string(
			IotaFaucetConnector.CLASS_NAME,
			nameof(options.config.endpoint),
			options.config.endpoint
		);

		this._config = options.config;
		Iota.populateConfig(this._config);
		this._client = Iota.createClient(this._config) as unknown as IotaClient;
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return IotaFaucetConnector.CLASS_NAME;
	}

	/**
	 * Fund an address with IOTA from the faucet.
	 * @param identity The identity of the user to access the vault keys.
	 * @param address The address to fund.
	 * @param timeoutInSeconds The timeout in seconds to wait for the funding to complete.
	 * @returns The amount funded.
	 */
	public async fundAddress(
		identity: string,
		address: string,
		timeoutInSeconds: number = 60
	): Promise<bigint> {
		Guards.stringValue(IotaFaucetConnector.CLASS_NAME, nameof(identity), identity);
		Guards.stringValue(IotaFaucetConnector.CLASS_NAME, nameof(address), address);

		try {
			const initialBalance = await this._client.getBalance({
				owner: address
			});

			const response = await requestIotaFromFaucetV0({
				host: this._config.endpoint,
				recipient: address
			});

			if (response?.error) {
				throw new GeneralError(
					IotaFaucetConnector.CLASS_NAME,
					"fundingFailed",
					undefined,
					response.error
				);
			}

			// Poll for balance change
			const numTries = Math.ceil(timeoutInSeconds / 5);
			for (let i = 0; i < numTries; i++) {
				const newBalance = await this._client.getBalance({
					owner: address
				});

				if (BigInt(newBalance.totalBalance) > BigInt(initialBalance.totalBalance)) {
					return BigInt(newBalance.totalBalance) - BigInt(initialBalance.totalBalance);
				}

				if (i < numTries - 1) {
					await new Promise(resolve => setTimeout(resolve, 5000));
				}
			}
		} catch (error) {
			const payloadError = Iota.extractPayloadError(error);
			if (
				payloadError.message.includes(
					"Too many requests from this client have been sent to the faucet"
				)
			) {
				throw new GeneralError(
					IotaFaucetConnector.CLASS_NAME,
					"faucetRateLimit",
					undefined,
					Iota.extractPayloadError(error)
				);
			}
			throw new GeneralError(
				IotaFaucetConnector.CLASS_NAME,
				"fundingFailed",
				undefined,
				Iota.extractPayloadError(error)
			);
		}

		return 0n;
	}
}
