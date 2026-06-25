# Wallet Connector Entity Storage Examples

These examples show local wallet workflows with entity storage, including schema setup and faucet-assisted funding.

## EntityStorageWalletConnector

```typescript
import { EntityStorageWalletConnector } from '@twin.org/wallet-connector-entity-storage';

const walletConnector = new EntityStorageWalletConnector({
  vaultConnectorType: 'vault',
  faucetConnectorType: 'faucet',
  walletAddressEntityStorageType: 'wallet-address',
  config: {
    vaultMnemonicId: 'mnemonic',
    coinType: 4218,
    networkName: 'ent'
  }
});

console.log(walletConnector.className()); // EntityStorageWalletConnector
```

```typescript
import { EntityStorageWalletConnector } from '@twin.org/wallet-connector-entity-storage';

const walletConnector = new EntityStorageWalletConnector({
  walletAddressEntityStorageType: 'wallet-address'
});

const identity = 'alice';
await walletConnector.create(identity);

const addresses = await walletConnector.getAddresses(identity, 0, 0, 3);
console.log(addresses[0]); // ent1q...
console.log(addresses[1]); // ent1q...
console.log(addresses[2]); // ent1q...
```

```typescript
import { EntityStorageWalletConnector } from '@twin.org/wallet-connector-entity-storage';

const walletConnector = new EntityStorageWalletConnector({
  faucetConnectorType: 'faucet',
  walletAddressEntityStorageType: 'wallet-address'
});

const identity = 'alice';
const address = 'ent1qzk3h4f8s8pl2nq8h8m5x4aclnvmf6m7l9h8v2j5f7dp5z8yqpd3r2';

const balance = await walletConnector.getBalance(identity, address);
console.log(balance.toString()); // 1000000000

const funded = await walletConnector.ensureBalance(identity, address, 2000000000n, 10);
console.log(funded); // true
```

```typescript
import { EntityStorageWalletConnector } from '@twin.org/wallet-connector-entity-storage';

const walletConnector = new EntityStorageWalletConnector({
  walletAddressEntityStorageType: 'wallet-address'
});

const transferId = await walletConnector.transfer(
  'alice',
  'ent1qzk3h4f8s8pl2nq8h8m5x4aclnvmf6m7l9h8v2j5f7dp5z8yqpd3r2',
  'ent1qz2y6wfj8n6r3xj2v4d6j7l8p0s4r3v8w5n0j2q9d7m4h1xj73v8t0',
  500000000n
);

console.log(transferId); // undefined
```

## EntityStorageFaucetConnector

```typescript
import { EntityStorageFaucetConnector } from '@twin.org/wallet-connector-entity-storage';

const faucetConnector = new EntityStorageFaucetConnector({
  walletAddressEntityStorageType: 'wallet-address'
});

console.log(faucetConnector.className()); // EntityStorageFaucetConnector
```

```typescript
import { EntityStorageFaucetConnector } from '@twin.org/wallet-connector-entity-storage';

const faucetConnector = new EntityStorageFaucetConnector({
  walletAddressEntityStorageType: 'wallet-address'
});

const funded = await faucetConnector.fundAddress(
  'alice',
  'ent1qzk3h4f8s8pl2nq8h8m5x4aclnvmf6m7l9h8v2j5f7dp5z8yqpd3r2',
  60
);

console.log(funded.toString()); // 1000000000
```

## WalletAddress

```typescript
import { WalletAddress } from '@twin.org/wallet-connector-entity-storage';

const walletAddress = new WalletAddress();
walletAddress.address = 'ent1qzk3h4f8s8pl2nq8h8m5x4aclnvmf6m7l9h8v2j5f7dp5z8yqpd3r2';
walletAddress.identity = 'alice';
walletAddress.balance = '1500000000';

console.log(walletAddress.address); // ent1qzk3h4f8s8pl2nq8h8m5x4aclnvmf6m7l9h8v2j5f7dp5z8yqpd3r2
console.log(walletAddress.balance); // 1500000000
```

## initSchema

```typescript
import { initSchema } from '@twin.org/wallet-connector-entity-storage';

initSchema();
```
