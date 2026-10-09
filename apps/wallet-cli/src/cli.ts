// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CLIBase } from "@3sixty/cli-core";
import { buildCommandAddress, buildCommandMnemonic } from "@3sixty/crypto-cli";
import type { Command } from "commander";
import { buildCommandFaucet } from "./commands/faucet.js";
import { buildCommandTransfer } from "./commands/transfer.js";

/**
 * The main entry point for the CLI.
 */
export class CLI extends CLIBase {
	/**
	 * Run the app.
	 * @param argv The process arguments.
	 * @param localesDirectory The directory for the locales, default to relative to the script.
	 * @param options Additional options.
	 * @param options.overrideOutputWidth Override the output width.
	 * @returns The exit code.
	 */
	public async run(
		argv: string[],
		localesDirectory?: string,
		options?: { overrideOutputWidth?: number }
	): Promise<number> {
		return this.execute(
			{
				title: "3Sixty Wallet",
				appName: "3sixty-wallet",
				version: "0.20.0-next.0", // x-release-please-version
				icon: "🌍",
				supportsEnvFiles: true,
				overrideOutputWidth: options?.overrideOutputWidth,
				showDevToolWarning: true
			},
			localesDirectory ?? path.join(path.dirname(fileURLToPath(import.meta.url)), "../locales"),
			argv
		);
	}

	/**
	 * Get the commands for the CLI.
	 * @param program The main program to add the commands to.
	 * @returns The list of commands.
	 * @internal
	 */
	protected getCommands(program: Command): Command[] {
		return [
			buildCommandMnemonic(),
			buildCommandAddress(),
			buildCommandFaucet(),
			buildCommandTransfer()
		];
	}
}
