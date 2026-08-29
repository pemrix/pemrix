//! Account state primitives.

/// Account balance type.
pub type Balance = u128;

/// Account nonce type.
pub type Nonce = u64;

/// State of a single account.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default, serde::Serialize, serde::Deserialize)]
pub struct Account {
    /// Account balance.
    pub balance: Balance,
    /// Transaction nonce.
    pub nonce: Nonce,
}

impl Account {
    /// Create a new account with the given balance and nonce.
    pub const fn new(balance: Balance, nonce: Nonce) -> Self {
        Self { balance, nonce }
    }
}
