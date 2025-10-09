// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { CLIDisplay, CLIParam } from "@twin.org/cli-core";
import { Converter, I18n, Is, StringHelper } from "@twin.org/core";
import { FaucetConnectorFactory } from "@twin.org/wallet-models";
import { Command, Option } from "commander";
import { setupFaucetConnector, setupVault, setupWalletConnector } from "./setupCommands";
import { WalletConnectorTypes } from "../models/walletConnectorTypes";

/**
 * Build the faucet command to be consumed by the CLI.
 * @returns The command.
 */
export function buildCommandFaucet(): Command {
	const command = new Command();
	command
		.name("faucet")
		.summary(I18n.formatMessage("commands.faucet.summary"))
		.description(I18n.formatMessage("commands.faucet.description"))
		.requiredOption(
			I18n.formatMessage("commands.faucet.options.address.param"),
			I18n.formatMessage("commands.faucet.options.address.description")
		)
		.addOption(
			new Option(
				I18n.formatMessage("commands.common.options.connector.param"),
				I18n.formatMessage("commands.common.options.connector.description")
			)
				.choices(Object.values(WalletConnectorTypes))
				.default(WalletConnectorTypes.Iota)
		)
		.option(
			I18n.formatMessage("commands.common.options.node.param"),
			I18n.formatMessage("commands.common.options.node.description"),
			"!NODE_URL"
		)
		.option(
			I18n.formatMessage("commands.common.options.network.param"),
			I18n.formatMessage("commands.common.options.network.description"),
			"!NETWORK"
		)
		.option(
			I18n.formatMessage("commands.faucet.options.faucet.param"),
			I18n.formatMessage("commands.faucet.options.faucet.description"),
			"!FAUCET_URL"
		)
		.option(
			I18n.formatMessage("commands.common.options.explorer.param"),
			I18n.formatMessage("commands.common.options.explorer.description"),
			"!EXPLORER_URL"
		)
		.action(actionCommandFaucet);

	return command;
}

/**
 * Action the faucet command.
 * @param opts The options for the command.
 * @param opts.address The address to fill from the faucet.
 * @param opts.faucet The faucet URL.
 * @param opts.connector The connector to perform the operations with.
 * @param opts.node The node URL.
 * @param opts.network The network to use for the connector.
 * @param opts.explorer The explorer URL.
 */
export async function actionCommandFaucet(opts: {
	address: string;
	faucet: string;
	connector?: WalletConnectorTypes;
	node: string;
	network?: string;
	explorer: string;
}): Promise<void> {
	const address: string = Converter.bytesToHex(CLIParam.hex("address", opts.address), true);
	const faucetEndpoint: string = CLIParam.url("faucet", opts.faucet);
	const nodeEndpoint: string = CLIParam.url("node", opts.node);
	const network: string | undefined =
		opts.connector === WalletConnectorTypes.Iota
			? CLIParam.stringValue("network", opts.network)
			: undefined;
	const explorerEndpoint: string = CLIParam.url("explorer", opts.explorer);

	CLIDisplay.value(
		I18n.formatMessage("commands.common.labels.connector"),
		opts.connector ?? WalletConnectorTypes.Iota
	);
	CLIDisplay.value(I18n.formatMessage("commands.common.labels.node"), nodeEndpoint);
	if (Is.stringValue(network)) {
		CLIDisplay.value(I18n.formatMessage("commands.common.labels.network"), network);
	}
	CLIDisplay.value(I18n.formatMessage("commands.faucet.labels.faucet"), faucetEndpoint);
	CLIDisplay.value(I18n.formatMessage("commands.common.labels.address"), address);
	CLIDisplay.value(I18n.formatMessage("commands.common.labels.explorer"), explorerEndpoint);
	CLIDisplay.break();

	CLIDisplay.task(I18n.formatMessage("commands.faucet.progress.requestingFunds"));
	CLIDisplay.break();

	CLIDisplay.spinnerStart();

	const faucetConnector = setupFaucetConnector(
		{ nodeEndpoint, network, endpoint: faucetEndpoint },
		opts.connector
	);

	const localIdentity = "local-identity";

	const fundsAdded = await faucetConnector.fundAddress(localIdentity, address);
	FaucetConnectorFactory.register("faucet", () => faucetConnector);

	CLIDisplay.spinnerStop();

	CLIDisplay.value(
		I18n.formatMessage("commands.faucet.labels.fundsAdded"),
		fundsAdded === 0n
			? I18n.formatMessage("commands.faucet.messages.noFundsAdded")
			: fundsAdded.toString()
	);
	CLIDisplay.break();

	CLIDisplay.task(I18n.formatMessage("commands.faucet.progress.requestingBalance"));
	CLIDisplay.break();

	setupVault();

	const walletConnector = setupWalletConnector({ nodeEndpoint, network }, opts.connector);

	const balance = await walletConnector.getBalance(localIdentity, address);

	CLIDisplay.value(I18n.formatMessage("commands.common.labels.balance"), balance.toString());
	CLIDisplay.break();

	CLIDisplay.value(
		I18n.formatMessage("commands.common.labels.explore"),
		opts.connector === WalletConnectorTypes.Iota
			? `${StringHelper.trimTrailingSlashes(explorerEndpoint)}/address/${address}?network=${network}`
			: `${StringHelper.trimTrailingSlashes(explorerEndpoint)}/addr/${address}`
	);
	CLIDisplay.break();

	CLIDisplay.done();
}
