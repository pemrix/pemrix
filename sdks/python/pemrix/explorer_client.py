"""Explorer client for querying blockchain data."""

from dataclasses import dataclass
from typing import Any


@dataclass
class ExplorerStatus:
    height: int
    transaction_count: int
    account_count: int


@dataclass
class ExplorerAccount:
    address: str
    balance: str
    nonce: int


class ExplorerClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def status(self) -> ExplorerStatus:
        return ExplorerStatus(height=0, transaction_count=0, account_count=0)

    async def block_by_height(self, height: int) -> Any:
        return None

    async def transaction(self, hash: str) -> Any:
        return None

    async def account(self, address: str) -> ExplorerAccount:
        raise RuntimeError("mock explorer client")
