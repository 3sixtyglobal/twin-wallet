// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { CLIDisplay } from "@twin.org/cli-core";
import { CLI } from "../src/cli.js";

let writeBuffer: string[] = [];
let errorBuffer: string[] = [];
const localesDirectory = "./dist/locales/";

describe("CLI", () => {
	beforeEach(() => {
		writeBuffer = [];
		errorBuffer = [];

		CLIDisplay.write = (buffer: string | Uint8Array): void => {
			writeBuffer.push(...buffer.toString().split("\n"));
		};

		CLIDisplay.writeError = (buffer: string | Uint8Array): void => {
			errorBuffer.push(...buffer.toString().split("\n"));
		};
	});

	test("Can execute with no command line options and receive help", async () => {
		const cli = new CLI();
		const exitCode = await cli.run(["", path.join(__dirname, "wallet-cli")], localesDirectory, {
			overrideOutputWidth: 1000
		});
		expect(exitCode).toBe(0);
		expect(writeBuffer.length).toEqual(23);
		expect(writeBuffer[0].includes("TWIN Wallet v0.9.2")).toEqual(true); // x-release-please-version
		expect(writeBuffer[1]).toEqual("");
		expect(writeBuffer[2]).toEqual("");
		expect(writeBuffer[3]).toEqual("");
		expect(writeBuffer[4]).toEqual("⚠️  ");
		expect(writeBuffer[5]).toEqual(
			"This tool is intended to be used for development purposes, it is not recommended for use in production scenarios."
		);
		expect(writeBuffer[6]).toEqual("");
		expect(writeBuffer[7]).toEqual("");
		expect(writeBuffer[8]).toEqual("");
		expect(writeBuffer[9]).toEqual("Usage: twin-wallet [command]");
		expect(writeBuffer[10]).toEqual("");
		expect(writeBuffer[11]).toEqual("Options:");
		expect(writeBuffer[12]).toEqual("  -V, --version        output the version number");
		expect(writeBuffer[13]).toEqual(
			'  --lang <lang>        The language to display the output in. (default: "en")'
		);
		expect(writeBuffer[14]).toEqual(
			"  --load-env [env...]  Load the env files to initialise any environment variables."
		);
		expect(writeBuffer[15]).toEqual("  -h, --help           display help for command");
		expect(writeBuffer[16]).toEqual("");
		expect(writeBuffer[17]).toEqual("Commands:");
		expect(writeBuffer[18]).toEqual("  mnemonic [options]   Create a mnemonic.");
		expect(writeBuffer[19]).toEqual(
			"  address [options]    Create addresses and keys from the seed."
		);
		expect(writeBuffer[20]).toEqual("  faucet [options]     Request funds from the faucet.");
		expect(writeBuffer[21]).toEqual(
			"  transfer [options]   Transfer funds from one address to another."
		);
		expect(writeBuffer[22]).toEqual("");
	});
});
