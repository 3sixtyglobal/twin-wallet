# Interface: IFaucetConnector

Interface describing a faucet connector.

## Extends

- `IComponent`

## Indexable

\[`key`: `string`\]: `any`

All methods are optional, so we introduce an index signature to allow
any additional properties or methods, which removes the TypeScript error where
the class has no properties in common with the type.

## Methods

### fundAddress()

> **fundAddress**(`identity`, `address`, `timeoutInSeconds?`): `Promise`\<`bigint`\>

Fund the wallet from the faucet.

#### Parameters

##### identity

`string`

The identity of the user to access the vault keys.

##### address

`string`

The hex encoded address of the address to fund.

##### timeoutInSeconds?

`number`

The timeout in seconds to wait for the funding to complete.

#### Returns

`Promise`\<`bigint`\>

The amount added to the address by the faucet.
