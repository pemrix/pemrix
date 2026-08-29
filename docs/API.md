# PEMRIX API Reference

This document describes the public REST API for the PEMRIX local testnet.

## Base URLs

| Service | Default URL |
|---|---|
| REST RPC | `http://127.0.0.1:60001` |
| gRPC | `http://127.0.0.1:60002` |
| Faucet | `http://127.0.0.1:60101` |
| Explorer | `http://127.0.0.1:60102` |
| Webhooks | `http://127.0.0.1:60103` |

## RPC Endpoints

### `GET /v1/status`

Returns the node status.

**Response:**

```json
{
  "status": "ok",
  "height": 42,
  "version": "0.1.0"
}
```

### `GET /v1/blocks/:height`

Returns a block by height.

**Response:** `200 OK` with block JSON, or `404 Not Found`.

### `GET /v1/blocks/hash/:hash`

Returns a block by hash.

### `GET /v1/transactions/:hash`

Returns a transaction by hash.

### `GET /v1/accounts/:address/balance`

Returns the balance of an address.

**Response:**

```json
{
  "address": "px...",
  "balance": 1000
}
```

### `POST /v1/transactions`

Submits a transaction.

**Request body:**

```json
{
  "transaction": {
    "sender": "px...",
    "recipient": "px...",
    "amount": 100,
    "nonce": 0,
    "fee": 1,
    "payload": []
  }
}
```

**Response:**

```json
{
  "hash": "...",
  "status": "pending",
  "payload": null
}
```

## gRPC Endpoints

PEMRIX also exposes a `NodeService` via gRPC on `http://127.0.0.1:60002` (default). The protobuf definition lives in `crates/pemrix-rpc/proto/pemrix_rpc_v1.proto`.

### `Status`

Returns the node status.

```protobuf
rpc Status(StatusRequest) returns (StatusResponse);
```

**Response:**

```protobuf
status: "ok"
height: 42
version: "0.1.0"
```

### `GetBlockByHeight`

Returns a block by height.

```protobuf
rpc GetBlockByHeight(BlockByHeightRequest) returns (BlockResponse);
```

### `GetBlockByHash`

Returns a block by hash (64-character lowercase hex).

```protobuf
rpc GetBlockByHash(BlockByHashRequest) returns (BlockResponse);
```

### `GetTransaction`

Returns a transaction by hash.

```protobuf
rpc GetTransaction(TransactionRequest) returns (TransactionResponse);
```

### `GetBalance`

Returns the balance of an address.

```protobuf
rpc GetBalance(BalanceRequest) returns (BalanceResponse);
```

**Response:**

```protobuf
address: "px..."
balance: "1000"
```

### `SendTransaction`

Submits a transaction.

```protobuf
rpc SendTransaction(SendTransactionRequest) returns (SendTransactionResponse);
```

**Request:**

```protobuf
transaction {
  sender: "px..."
  recipient: "px..."
  amount: "100"
  nonce: 0
  fee: "1"
  payload: ""
}
```

**Response:**

```protobuf
hash: "..."
status: "pending"
```

## Faucet Endpoints

### `POST /faucet/request`

Requests test tokens.

**Request body:**

```json
{
  "address": "px...",
  "amount": "1000"
}
```

**Response:**

```json
{
  "success": true,
  "tx_hash": "...",
  "message": "tokens sent"
}
```

## Explorer Endpoints

### `GET /explorer/status`

Returns indexed chain status.

### `GET /explorer/blocks`

Returns the 20 most recent blocks.

### `GET /explorer/blocks/:height`

Returns a block by height.

### `GET /explorer/blocks/hash/:hash`

Returns a block by hash.

### `GET /explorer/transactions/:hash`

Returns a transaction by hash.

### `GET /explorer/accounts/:address`

Returns account information.

## Webhook Endpoints

### `POST /webhooks/subscribe`

Creates a webhook subscription.

**Request body:**

```json
{
  "url": "https://your-server.example.com/webhook",
  "events": ["block", "transaction", "transaction_confirmed"]
}
```

**Response:**

```json
{
  "id": "...",
  "url": "...",
  "events": ["block"],
  "secret": "..."
}
```

### `GET /webhooks`

Lists active subscriptions.

### `DELETE /webhooks/:id`

Deletes a subscription.

## Webhook Payloads

Webhook payloads are signed with HMAC-SHA256 using the subscription secret.

```json
{
  "subscription_id": "...",
  "event_type": "block",
  "payload": { "height": 42 },
  "signature": "..."
}
```

Verify the signature by computing `HMAC-SHA256(secret, payload_json)`.
