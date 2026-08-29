# PEMRIX Formal Verification Specification

This document specifies the critical state transition of the PEMRIX ledger — the account transfer — in a form suitable for future mechanized proof.

## 1. Scope

The first formal verification target is the native transfer function executed by the consensus state store:

- `pemrix_storage::state::StateStore::transfer`
- `pemrix_vm::native::NativeExecutor::execute` for transfer transactions

This is the most security-critical state transition because it directly moves value between accounts.

## 2. State Model

### 2.1 Account

```rust
struct Account {
    balance: u128,
    nonce: u64,
}
```

### 2.2 Global State

The global state is a partial map from `Address` to `Account`:

```
State : Address ⇀ Account
```

A missing entry is equivalent to `Account { balance: 0, nonce: 0 }`.

### 2.3 Transaction

```rust
struct Transaction {
    sender: Address,
    recipient: Address,
    amount: u128,
    nonce: u64,
    fee: u128,
    payload: Vec<u8>,
}
```

For the transfer verification we consider transactions with `payload == []`.

## 3. State Transition Specification

### 3.1 Transfer Function Signature

```rust
fn transfer(
    state: &mut State,
    from: Address,
    to: Address,
    amount: u128,
    fee: u128,
) -> Result<(), StorageError>
```

### 3.2 Preconditions

1. `from` and `to` are valid 32-byte addresses.
2. `from` has an account `A_from` in `state`.
3. `A_from.balance >= amount + fee` (no overflow in the sum).
4. `A_from.balance - (amount + fee)` does not underflow.
5. `A_to.balance + amount` does not overflow.
6. `A_from.nonce + 1` does not overflow.

### 3.3 Postconditions

Let `S` be the state before and `S'` the state after a successful transfer.

1. `S'(from).balance == S(from).balance - amount - fee`
2. `S'(from).nonce == S(from).nonce + 1`
3. `S'(to).balance == S(to).balance + amount`   (using 0 if `to` was absent)
4. `S'(to).nonce == S(to).nonce`                (recipient nonce is unchanged)
5. For all addresses `a` not in `{from, to}`: `S'(a) == S(a)`
6. Total money supply is preserved except for the fee, which is burned:
   `sum(S') == sum(S) - fee`

### 3.4 Error Conditions

The transfer must fail (state unchanged) if any of the following holds:

1. `from` is not present in `state`.
2. `amount + fee` overflows `u128`.
3. `S(from).balance < amount + fee`.
4. `S(to).balance + amount` overflows `u128`.
5. `S(from).nonce + 1` overflows `u64`.

## 4. Invariants

The following invariants must hold across every block:

### 4.1 Conservation of Money

```
forall blocks b:
  sum(accounts after b) <= sum(accounts before b)
```

Fees are burned, so the total supply is non-increasing.

### 4.2 Non-Negative Balances

```
forall a in State: State(a).balance >= 0
```

### 4.3 Monotonic Nonces

```
forall a in State: State'(a).nonce >= State(a).nonce
```

### 4.4 Sender Nonce Increment

For every executed transfer transaction `tx`:

```
State'(tx.sender).nonce == State(tx.sender).nonce + 1
```

## 5. Verification Approach

### 5.1 Tooling Candidates

| Tool | Strength | Fit |
|---|---|---|
| **MIRAI** | Rust abstract interpreter | Good starting point; can check overflow and panic freedom. |
| **Kani** | Rust model checker | Excellent for bounded verification of Rust code. |
| **Prusti** | Rust verifier with Viper backend | Good for Hoare-style proofs on safe Rust. |
| **Coq/Lean** | General theorem provers | Heavyweight; suitable for full protocol semantics. |

Recommended path: start with **Kani** to prove panic-freedom and overflow freedom of `transfer`, then move to **Prusti** or **Coq** for full functional correctness.

### 5.2 Verification Properties to Prove

1. `transfer` never panics on valid input.
2. `transfer` returns an error exactly when a precondition is violated.
3. When `transfer` succeeds, the postconditions hold.
4. `NativeExecutor::execute` on a transfer transaction calls `transfer` with the correct parameters.
5. Block execution preserves the global invariants.

### 5.3 Suggested Kani Harness

```rust
#[cfg(kani)]
mod verification {
    use super::*;

    #[kani::proof]
    fn transfer_preserves_invariants() {
        let mut store = StateStore::new_in_memory();
        let from = kani::any();
        let to = kani::any();
        let amount: u128 = kani::any();
        let fee: u128 = kani::any();

        // Assume sender exists with sufficient balance
        store.set_account(&from, Account::new(u128::MAX, 0)).unwrap();

        let old_from = store.balance(&from).unwrap();
        let old_to = store.balance(&to).unwrap_or(0);

        if store.transfer(&from, &to, amount, fee).is_ok() {
            assert_eq!(store.balance(&from).unwrap(), old_from - amount - fee);
            assert_eq!(store.balance(&to).unwrap(), old_to + amount);
        } else {
            assert_eq!(store.balance(&from).unwrap(), old_from);
            assert_eq!(store.balance(&to).unwrap_or(0), old_to);
        }
    }
}
```

## 6. Limitations and Future Work

- This specification covers only native transfers. Smart contract execution will need its own specification.
- The current encoding uses JSON placeholders; formal verification should target the final canonical binary encoder.
- Multi-signature and staking operations will extend this model.

## 7. References

- `crates/pemrix-storage/src/state.rs`
- `crates/pemrix-vm/src/native.rs`
- [PEMRIX Security Portal](README.md)
