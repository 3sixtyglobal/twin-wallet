# 3Sixty Wallet

This repository provides a focused set of wallet building blocks and a companion command-line tool for practical operational workflows. The libraries define shared connector contracts, add storage-backed implementations for local and test scenarios, and provide network-backed implementations for interaction with IOTA infrastructure.

Together, these components are designed to keep wallet integration consistent across applications while still allowing connector choice based on runtime needs. The result is a clearer path from local development and testing to network-connected execution.

## Packages

- [wallet-models](packages/wallet-models/README.md) - Defines shared wallet and faucet connector interfaces together with factories for resolving connector implementations.
- [wallet-connector-entity-storage](packages/wallet-connector-entity-storage/README.md) - Implements wallet and faucet connectors backed by entity storage for local and test workflows.
- [wallet-connector-iota](packages/wallet-connector-iota/README.md) - Implements wallet and faucet connectors for IOTA networks, including balance checks, transfers, and funding flows.

## Apps

- [wallet-cli](apps/wallet-cli/README.md) - Provides command-line tooling for creating wallets, requesting faucet funds, and transferring value.

## Contributing

To contribute to this package see the guidelines for building and publishing in [CONTRIBUTING](./CONTRIBUTING.md)

## Origin

This repository is derived from the original [iotaledger/twin-wallet](https://github.com/iotaledger/twin-wallet) repository.
