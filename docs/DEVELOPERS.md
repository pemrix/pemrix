# PEMRIX Developer Quickstart

This guide gets you started with the PEMRIX local testnet in under 15 minutes.

## Prerequisites

- Rust 1.75 or later
- Cargo
- `curl` or any HTTP client

## Build

```bash
git clone https://github.com/pemrix/pemrix
cd pemrix
cargo build --release
```

## Start the local testnet

```bash
./target/release/pemrix testnet --data-dir ./testnet-data
```

This starts:

- PEMRIX node producing blocks every 2 seconds
- RPC server at `http://127.0.0.1:60001`
- Faucet at `http://127.0.0.1:60101`
- Explorer API at `http://127.0.0.1:60102`
- Webhook server at `http://127.0.0.1:60103`

## Create a wallet

Use the Rust SDK or generate keys with any compatible Ed25519 library.

```rust
use pemrix_sdk::Wallet;

let wallet = Wallet::generate()?;
println!("Address: {}", wallet.address());
```

## Request test tokens from the faucet

```bash
curl -X POST http://127.0.0.1:60101/faucet/request \
  -H "Content-Type: application/json" \
  -d '{
    "address": "pxYOUR_ADDRESS_HERE",
    "amount": "1000"
  }'
```

Response:

```json
{
  "success": true,
  "tx_hash": "...",
  "message": "tokens sent"
}
```

## Check your balance

```bash
curl http://127.0.0.1:60001/v1/accounts/pxYOUR_ADDRESS_HERE/balance
```

## Send a transaction

```bash
curl -X POST http://127.0.0.1:60001/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transaction": {
      "sender": "pxYOUR_ADDRESS_HERE",
      "recipient": "pxRECIPIENT_ADDRESS_HERE",
      "amount": 100,
      "nonce": 0,
      "fee": 1,
      "payload": []
    }
  }'
```

## Run the wallet-to-merchant payment demo

A built-in demo simulates a customer paying a shopkeeper with PEMRIX:

```bash
# Terminal 1: start the testnet
./target/release/pemrix testnet --data-dir ./testnet-data

# Terminal 2: run the demo
./target/release/pemrix demo
```

The demo will:

1. Generate a payer wallet and a merchant wallet.
2. Fund the payer from the testnet faucet.
3. Display a merchant QR payload (`pemrix:pay?address=...&amount=...`).
4. Submit a transfer transaction from the payer to the merchant.
5. Poll balances until the payment settles.

You can also point the demo at custom RPC/faucet URLs:

```bash
./target/release/pemrix demo --rpc-url http://127.0.0.1:60001 --faucet-url http://127.0.0.1:60101
```

## Query the explorer

```bash
# Network status
curl http://127.0.0.1:60102/explorer/status

# Latest blocks
curl http://127.0.0.1:60102/explorer/blocks

# Block by height
curl http://127.0.0.1:60102/explorer/blocks/1

# Account
curl http://127.0.0.1:60102/explorer/accounts/pxYOUR_ADDRESS_HERE
```

## Subscribe to webhooks

```bash
curl -X POST http://127.0.0.1:60103/webhooks/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-server.example.com/webhook",
    "events": ["block", "transaction"]
  }'
```

## Use the sandbox

For unit tests and quick experiments, use the in-memory `pemrix-sandbox` crate instead of the live testnet. It provides an isolated chain with a solo consensus engine.

```rust
use pemrix_sandbox::Sandbox;
use pemrix_primitives::{Address, Hash, Transaction};

#[tokio::main]
async fn main() {
    let mut sandbox = Sandbox::default();
    let alice = Address::from_public_key_hash(Hash::hash_bytes(b"alice"));
    let bob = Address::from_public_key_hash(Hash::hash_bytes(b"bob"));

    sandbox.fund(alice, 1_000).unwrap();
    let tx = Transaction::transfer(alice, bob, 100, 0, 1);
    sandbox.submit(tx).unwrap();

    let block = sandbox.produce_block().await.unwrap();
    assert_eq!(block.header.height, 1);
    assert_eq!(sandbox.balance(&alice).unwrap(), 899);
    assert_eq!(sandbox.balance(&bob).unwrap(), 100);
}
```

The sandbox supports funding accounts, submitting transactions, producing blocks, querying balances/blocks/transactions, and resetting state.

## Next steps

- Read the full API reference: [`docs/API.md`](API.md)
- Read the architecture: [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
- Explore the SDK examples in `crates/pemrix-sdk/`
