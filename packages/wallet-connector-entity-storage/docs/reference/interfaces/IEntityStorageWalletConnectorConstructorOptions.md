# Interface: IEntityStorageWalletConnectorConstructorOptions

Options for the entity storage wallet connector.

## Properties

### vaultConnectorType? {#vaultconnectortype}

> `optional` **vaultConnectorType?**: `string`

Vault connector to use for wallet secrets.

#### Default

```ts
vault
```

***

### faucetConnectorType? {#faucetconnectortype}

> `optional` **faucetConnectorType?**: `string`

Optional faucet for requesting funds.

#### Default

```ts
faucet
```

***

### walletAddressEntityStorageType? {#walletaddressentitystoragetype}

> `optional` **walletAddressEntityStorageType?**: `string`

The entity storage for wallets.

#### Default

```ts
wallet-address
```

***

### config? {#config}

> `optional` **config?**: [`IEntityStorageWalletConnectorConfig`](IEntityStorageWalletConnectorConfig.md)

The configuration for the wallet connector.
