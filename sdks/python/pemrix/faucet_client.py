"""Faucet client for requesting test tokens."""

from dataclasses import dataclass


@dataclass
class FaucetResponse:
    success: bool
    tx_hash: str
    message: str


class FaucetClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def request(self, address: str, amount: str) -> FaucetResponse:
        return FaucetResponse(
            success=True,
            tx_hash="mock",
            message="mock faucet response",
        )
