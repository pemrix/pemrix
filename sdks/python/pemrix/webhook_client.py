"""Webhook client for managing subscriptions."""

from dataclasses import dataclass
from typing import Literal

WebhookEventType = Literal["block", "transaction", "transaction_confirmed"]


@dataclass
class SubscriptionResponse:
    id: str
    url: str
    events: list[WebhookEventType]
    secret: str


class WebhookClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def subscribe(
        self, url: str, events: list[WebhookEventType]
    ) -> SubscriptionResponse:
        return SubscriptionResponse(
            id="mock-id",
            url=url,
            events=events,
            secret="mock-secret",
        )
