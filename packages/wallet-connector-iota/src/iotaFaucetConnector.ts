// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Guards } from "@3sixty/core";
import { Iota } from "@3sixty/dlt-iota";
import { nameof } from "@3sixty/nameof";
import type { IFaucetConnector } from "@3sixty/wallet-models";
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
		return Iota.fundAddress(
			this._config,
			this._config.endpoint,
			identity,
			address,
			timeoutInSeconds
		);
	}
}
