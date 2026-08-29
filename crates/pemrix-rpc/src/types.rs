//! RPC request/response types.

use pemrix_primitives::{Address, Balance, Delegation, Hash, Transaction, ValidatorRecord};
use serde::{Deserialize, Serialize};

/// Response for a balance query.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct BalanceResponse {
    /// Account address.
    pub address: Address,
    /// Account balance.
    pub balance: Balance,
}

/// Response for a block query.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct BlockResponse {
    /// Block hash.
    pub hash: Hash,
    /// Block height.
    pub height: u64,
    /// Response payload.
    pub payload: serde_json::Value,
}

/// Response for a transaction query.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TransactionResponse {
    /// Transaction hash.
    pub hash: Hash,
    /// Transaction status.
    pub status: String,
    /// Transaction payload.
    pub payload: serde_json::Value,
}

/// Response for a nonce query.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct NonceResponse {
    /// Account address.
    pub address: Address,
    /// Account nonce.
    pub nonce: u64,
}

/// Response for a validator query.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ValidatorResponse {
    /// Validator operator address.
    pub address: Address,
    /// Validator record.
    pub validator: ValidatorRecord,
}

/// Response for a delegation query.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct DelegationResponse {
    /// Delegator address.
    pub delegator: Address,
    /// Validator address.
    pub validator: Address,
    /// Delegation record.
    pub delegation: Delegation,
}

/// Request to send a transaction.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct SendTransactionRequest {
    /// Raw transaction bytes.
    pub transaction: Transaction,
}
