# Wallet Connector IOTA Examples

These snippets cover common wallet and faucet flows for development and integration testing.

## IotaWalletConnector

```typescript
import { IotaWalletConnector } from '@3sixty/wallet-connector-iota';

const walletConnector = new IotaWalletConnector({
  vaultConnectorType: 'vault',
  faucetConnectorType: 'faucet',
  config: {
    clientOptions: {
      url: 'https://api.testnet.iotaledger.net'
    },
    vaultMnemonicId: 'mnemonic',
    vaultSeedId: 'seed'
  }
});

console.log(walletConnector.className()); // IotaWalletConnector
```

```typescript
import { IotaWalletConnector } from '@3sixty/wallet-connector-iota';

const walletConnector = new IotaWalletConnector({
  config: {
    clientOptions: {
      url: 'https://api.testnet.iotaledger.net'
    }
  }
});

const identity = 'alice';
await walletConnector.create(identity);

const addresses = await walletConnector.getAddresses(identity, 0, 0, 2);
console.log(addresses[0]); // tst1q...
console.log(addresses[1]); // tst1q...
```

```typescript
import { IotaWalletConnector } from '@3sixty/wallet-connector-iota';

const walletConnector = new IotaWalletConnector({
  faucetConnectorType: 'faucet',
  config: {
    clientOptions: {
      url: 'https://api.testnet.iotaledger.net'
    }
  }
});

const identity = 'alice';
const address = 'tst1qzl6pvdadahge7yyqdyknrutuwnjafntdjlnfv94vndue9qupkr9242gp8q';

const balance = await walletConnector.getBalance(identity, address);
console.log(balance.toString()); // 1200000000

const ready = await walletConnector.ensureBalance(identity, address, 1000000000n, 30);
console.log(ready); // true
```

```typescript
import { IotaWalletConnector } from '@3sixty/wallet-connector-iota';

const walletConnector = new IotaWalletConnector({
  config: {
    clientOptions: {
      url: 'https://api.testnet.iotaledger.net'
    }
  }
});

const transferId = await walletConnector.transfer(
  'alice',
  'tst1qzl6pvdadahge7yyqdyknrutuwnjafntdjlnfv94vndue9qupkr9242gp8q',
  'tst1qpjh2cagrdg9t2rvj9vmukhtqp45wex3zjtprwngmh24atze6xuuq2uwzv8',
  500000n
);

console.log(transferId); // FuqX...b9n
```

## IotaFaucetConnector

```typescript
import { IotaFaucetConnector } from '@3sixty/wallet-connector-iota';

const faucetConnector = new IotaFaucetConnector({
  config: {
    clientOptions: {
      url: 'https://api.testnet.iotaledger.net'
    },
    endpoint: 'https://faucet.testnet.iotaledger.net/api/enqueue'
  }
});

console.log(faucetConnector.className()); // IotaFaucetConnector
```

```typescript
import { IotaFaucetConnector } from '@3sixty/wallet-connector-iota';

const faucetConnector = new IotaFaucetConnector({
  config: {
    clientOptions: {
      url: 'https://api.testnet.iotaledger.net'
    },
    endpoint: 'https://faucet.testnet.iotaledger.net/api/enqueue'
  }
});

const funded = await faucetConnector.fundAddress(
  'alice',
  'tst1qzl6pvdadahge7yyqdyknrutuwnjafntdjlnfv94vndue9qupkr9242gp8q',
  60
);

console.log(funded.toString()); // 100000000
```
