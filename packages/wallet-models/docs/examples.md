# Wallet Models Examples

These examples show how to define connector contracts and resolve connector implementations through factories in application code.

## IWalletConnector

```typescript
import type { IWalletConnector } from '@twin.org/wallet-models';

class DemoWalletConnector implements IWalletConnector {
  public className(): string {
    return 'DemoWalletConnector';
  }

  public async create(identity: string): Promise<void> {
    console.log(`Created wallet for ${identity}`); // Created wallet for demo-user
  }

  public async getAddresses(
    identity: string,
    accountIndex: number,
    startAddressIndex: number,
    count: number
  ): Promise<string[]> {
    const addresses = [
      `${identity}-${accountIndex}-${startAddressIndex}`,
      `${identity}-${accountIndex}-${startAddressIndex + 1}`
    ];
    return addresses.slice(0, count);
  }

  public async getBalance(identity: string, address: string): Promise<bigint> {
    return identity.length > 0 && address.length > 0 ? 2500000n : 0n;
  }

  public async ensureBalance(
    identity: string,
    address: string,
    ensureBalance: bigint,
    timeoutInSeconds?: number
  ): Promise<boolean> {
    const currentBalance = await this.getBalance(identity, address);
    return currentBalance >= ensureBalance || timeoutInSeconds === 0;
  }

  public async transfer(
    identity: string,
    addressSource: string,
    addressDest: string,
    amount: bigint
  ): Promise<string | undefined> {
    if (identity.length > 0 && addressSource.length > 0 && addressDest.length > 0 && amount > 0n) {
      return 'tx-demo-001';
    }
    return undefined;
  }
}

const connector = new DemoWalletConnector();
await connector.create('demo-user');

const addresses = await connector.getAddresses('demo-user', 0, 0, 2);
console.log(addresses[0]); // demo-user-0-0

const balance = await connector.getBalance('demo-user', addresses[0]);
console.log(balance.toString()); // 2500000

const hasEnough = await connector.ensureBalance('demo-user', addresses[0], 1000000n, 15);
console.log(hasEnough); // true

const transferId = await connector.transfer('demo-user', addresses[0], 'demo-user-0-2', 500000n);
console.log(transferId); // tx-demo-001
```

## IFaucetConnector

```typescript
import type { IFaucetConnector } from '@twin.org/wallet-models';

class DemoFaucetConnector implements IFaucetConnector {
  public className(): string {
    return 'DemoFaucetConnector';
  }

  public async fundAddress(
    identity: string,
    address: string,
    timeoutInSeconds?: number
  ): Promise<bigint> {
    const multiplier = timeoutInSeconds && timeoutInSeconds > 30 ? 2n : 1n;
    return identity.length > 0 && address.length > 0 ? 1000000n * multiplier : 0n;
  }
}

const faucet = new DemoFaucetConnector();
console.log(faucet.className()); // DemoFaucetConnector

const funded = await faucet.fundAddress('demo-user', 'ent1qzexampleaddress', 45);
console.log(funded.toString()); // 2000000
```

## WalletConnectorFactory

```typescript
import { WalletConnectorFactory, type IWalletConnector } from '@twin.org/wallet-models';

const walletConnector = WalletConnectorFactory.get('iota') as IWalletConnector;

const addresses = await walletConnector.getAddresses('wallet-user', 0, 0, 1);
console.log(addresses.length); // 1
```

## FaucetConnectorFactory

```typescript
import { FaucetConnectorFactory, type IFaucetConnector } from '@twin.org/wallet-models';

const faucetConnector = FaucetConnectorFactory.getIfExists('faucet') as
  IFaucetConnector | undefined;

if (faucetConnector) {
  const amount = await faucetConnector.fundAddress('wallet-user', 'ent1qzexampleaddress', 30);
  console.log(amount.toString()); // 1000000000
}
```
