//! gRPC service generated from protobuf definitions.
//!
//! The `NodeService` implementation is backed by the shared [`RpcState`] used by
//! the REST server, so gRPC and REST clients observe the same chain state.

#![allow(clippy::result_large_err)]

use crate::RpcState;
use pemrix_primitives::{Address, Block, Hash, Transaction};
use std::str::FromStr;
use tonic::{Request, Response, Status};

mod proto {
    tonic::include_proto!("pemrix.rpc.v1");
}

pub use proto::node_service_server::{NodeService, NodeServiceServer};

use proto::{
    BalanceRequest, BalanceResponse, BlockBody, BlockByHashRequest, BlockByHeightRequest,
    BlockHeader, BlockResponse, SendTransactionRequest, SendTransactionResponse, StatusRequest,
    StatusResponse, Transaction as ProtoTransaction, TransactionRequest, TransactionResponse,
};

/// gRPC service implementation backed by shared RPC state.
#[derive(Clone, Debug, Default)]
pub struct GrpcService {
    state: RpcState,
}

impl GrpcService {
    /// Create a new gRPC service.
    pub fn new(state: RpcState) -> Self {
        Self { state }
    }
}

fn parse_hash(s: &str) -> Result<Hash, Status> {
    Hash::from_str(s).map_err(|e| Status::invalid_argument(format!("invalid hash: {e}")))
}

fn parse_address(s: &str) -> Result<Address, Status> {
    Address::from_str(s).map_err(|e| Status::invalid_argument(format!("invalid address: {e}")))
}

fn transaction_to_proto(tx: &Transaction) -> ProtoTransaction {
    ProtoTransaction {
        sender: tx.sender.to_string(),
        recipient: tx.recipient.to_string(),
        amount: tx.amount.to_string(),
        nonce: tx.nonce,
        fee: tx.fee.to_string(),
        payload: tx.payload.clone(),
    }
}

fn proto_to_transaction(proto: ProtoTransaction) -> Result<Transaction, Status> {
    Ok(Transaction {
        sender: parse_address(&proto.sender)?,
        recipient: parse_address(&proto.recipient)?,
        amount: proto
            .amount
            .parse::<u128>()
            .map_err(|e| Status::invalid_argument(format!("invalid amount: {e}")))?,
        nonce: proto.nonce,
        fee: proto
            .fee
            .parse::<u128>()
            .map_err(|e| Status::invalid_argument(format!("invalid fee: {e}")))?,
        payload: proto.payload,
    })
}

fn block_to_proto(block: Block) -> BlockResponse {
    BlockResponse {
        hash: block.hash().to_string(),
        height: block.header.height,
        header: Some(BlockHeader {
            height: block.header.height,
            timestamp: block.header.timestamp,
            previous_hash: block.header.previous_hash.to_string(),
            state_root: block.header.state_root.to_string(),
            tx_root: block.header.tx_root.to_string(),
            proposer: hex::encode(block.header.proposer),
        }),
        body: Some(BlockBody {
            transactions: block
                .body
                .transactions
                .iter()
                .map(transaction_to_proto)
                .collect(),
        }),
    }
}

#[tonic::async_trait]
impl NodeService for GrpcService {
    async fn status(
        &self,
        _request: Request<StatusRequest>,
    ) -> Result<Response<StatusResponse>, Status> {
        Ok(Response::new(StatusResponse {
            status: "ok".to_string(),
            height: self.state.height().await,
            version: env!("CARGO_PKG_VERSION").to_string(),
        }))
    }

    async fn get_block_by_height(
        &self,
        request: Request<BlockByHeightRequest>,
    ) -> Result<Response<BlockResponse>, Status> {
        let height = request.into_inner().height;
        let block = self
            .state
            .get_block_by_height(height)
            .await
            .ok_or_else(|| Status::not_found(format!("block at height {height} not found")))?;
        Ok(Response::new(block_to_proto(block)))
    }

    async fn get_block_by_hash(
        &self,
        request: Request<BlockByHashRequest>,
    ) -> Result<Response<BlockResponse>, Status> {
        let hash = parse_hash(&request.into_inner().hash)?;
        let block = self
            .state
            .get_block_by_hash(&hash)
            .await
            .ok_or_else(|| Status::not_found(format!("block with hash {hash} not found")))?;
        Ok(Response::new(block_to_proto(block)))
    }

    async fn get_transaction(
        &self,
        request: Request<TransactionRequest>,
    ) -> Result<Response<TransactionResponse>, Status> {
        let hash = parse_hash(&request.into_inner().hash)?;
        let tx = self
            .state
            .get_transaction(&hash)
            .await
            .ok_or_else(|| Status::not_found(format!("transaction {hash} not found")))?;
        Ok(Response::new(TransactionResponse {
            hash: hash.to_string(),
            status: "confirmed".to_string(),
            transaction: Some(transaction_to_proto(&tx)),
        }))
    }

    async fn get_balance(
        &self,
        request: Request<BalanceRequest>,
    ) -> Result<Response<BalanceResponse>, Status> {
        let address = parse_address(&request.into_inner().address)?;
        let balance = self
            .state
            .get_account(&address)
            .await
            .map_or(0, |a| a.balance);
        Ok(Response::new(BalanceResponse {
            address: address.to_string(),
            balance: balance.to_string(),
        }))
    }

    async fn send_transaction(
        &self,
        request: Request<SendTransactionRequest>,
    ) -> Result<Response<SendTransactionResponse>, Status> {
        let proto_tx = request
            .into_inner()
            .transaction
            .ok_or_else(|| Status::invalid_argument("transaction is required"))?;
        let tx = proto_to_transaction(proto_tx)?;
        let hash = tx.hash();
        self.state.store_transaction(hash, tx.clone()).await;
        self.state.submit_transaction(tx).await;
        Ok(Response::new(SendTransactionResponse {
            hash: hash.to_string(),
            status: "pending".to_string(),
        }))
    }
}

/// Start a gRPC server on the given listen address using the shared RPC state.
pub async fn serve(
    state: RpcState,
    listen: impl Into<String>,
) -> Result<(), Box<dyn std::error::Error>> {
    let addr = listen.into().parse()?;
    let service = GrpcService::new(state);
    tonic::transport::Server::builder()
        .add_service(NodeServiceServer::new(service))
        .serve(addr)
        .await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use pemrix_primitives::{Account, Address, Block, BlockBody, BlockHeader, Hash, Transaction};

    #[tokio::test]
    async fn grpc_status_returns_height() {
        let state = RpcState::new();
        let service = GrpcService::new(state);
        let response = service
            .status(Request::new(StatusRequest {}))
            .await
            .unwrap()
            .into_inner();
        assert_eq!(response.status, "ok");
        assert_eq!(response.height, 0);
    }

    #[tokio::test]
    async fn grpc_get_balance_for_known_account() {
        let state = RpcState::new();
        let address = Address::from_public_key_hash(Hash::hash_bytes(b"alice"));
        state.set_account(address, Account::new(5_000, 0)).await;

        let service = GrpcService::new(state);
        let response = service
            .get_balance(Request::new(BalanceRequest {
                address: address.to_string(),
            }))
            .await
            .unwrap()
            .into_inner();
        assert_eq!(response.address, address.to_string());
        assert_eq!(response.balance, "5000");
    }

    #[tokio::test]
    async fn grpc_get_block_by_height() {
        let state = RpcState::new();
        let block = Block {
            header: BlockHeader {
                height: 7,
                timestamp: 1,
                previous_hash: Hash::hash_bytes(b"prev"),
                state_root: Hash::hash_bytes(b"state"),
                tx_root: Hash::hash_bytes(b"txs"),
                proposer: [0u8; 32],
            },
            body: BlockBody {
                transactions: vec![Transaction::transfer(
                    Address::from_public_key_hash(Hash::hash_bytes(b"a")),
                    Address::from_public_key_hash(Hash::hash_bytes(b"b")),
                    100,
                    0,
                    1,
                )],
            },
        };
        state.store_block(block).await;

        let service = GrpcService::new(state);
        let response = service
            .get_block_by_height(Request::new(BlockByHeightRequest { height: 7 }))
            .await
            .unwrap()
            .into_inner();
        assert_eq!(response.height, 7);
        assert!(!response.hash.is_empty());
    }

    #[tokio::test]
    async fn grpc_send_transaction_stores_tx() {
        let state = RpcState::new();
        let service = GrpcService::new(state.clone());
        let tx = Transaction::transfer(
            Address::from_public_key_hash(Hash::hash_bytes(b"alice")),
            Address::from_public_key_hash(Hash::hash_bytes(b"bob")),
            250,
            1,
            5,
        );
        let expected_hash = tx.hash().to_string();

        let response = service
            .send_transaction(Request::new(SendTransactionRequest {
                transaction: Some(transaction_to_proto(&tx)),
            }))
            .await
            .unwrap()
            .into_inner();
        assert_eq!(response.hash, expected_hash);
        assert_eq!(response.status, "pending");

        let stored = state.get_transaction(&tx.hash()).await;
        assert!(stored.is_some());
        assert_eq!(stored.unwrap().amount, 250);
    }
}
