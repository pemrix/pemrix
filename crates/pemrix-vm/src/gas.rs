//! Gas metering.

/// Gas units for execution metering.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default)]
pub struct Gas(pub u64);

impl Gas {
    /// Create a new gas value.
    pub const fn new(amount: u64) -> Self {
        Self(amount)
    }

    /// Subtract gas, returning false if exhausted.
    pub fn consume(&mut self, amount: u64) -> bool {
        if self.0 < amount {
            false
        } else {
            self.0 -= amount;
            true
        }
    }

    /// Return remaining gas.
    pub fn remaining(&self) -> u64 {
        self.0
    }
}
