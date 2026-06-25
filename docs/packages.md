# Wallet Packages

## wallet-models

This package defines shared wallet and faucet connector contracts and provides factory utilities used to resolve connector implementations. It gives consuming libraries and tools a consistent integration surface so wallet operations can be swapped or extended without changing higher-level business logic.

- [README](../packages/wallet-models/README.md)
- [Examples](../packages/wallet-models/docs/examples.md)
- [Changelog](../packages/wallet-models/docs/changelog.md)

## wallet-connector-entity-storage

This package provides wallet and faucet connectors that persist address and balance state through entity storage abstractions. It is well suited for local workflows, deterministic tests, and integration scenarios where lightweight storage-backed wallet behaviour is needed.

- [README](../packages/wallet-connector-entity-storage/README.md)
- [Examples](../packages/wallet-connector-entity-storage/docs/examples.md)
- [Changelog](../packages/wallet-connector-entity-storage/docs/changelog.md)

## wallet-connector-iota

This package integrates wallet and faucet operations with IOTA network services, including address generation, balance checks, and value transfers. It is useful when applications need practical connector behaviour aligned with node and faucet infrastructure in live or test environments.

- [README](../packages/wallet-connector-iota/README.md)
- [Examples](../packages/wallet-connector-iota/docs/examples.md)
- [Changelog](../packages/wallet-connector-iota/docs/changelog.md)
- [IOTA Documentation](https://docs.iota.org/)
