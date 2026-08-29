# PEMRIX Python SDK

Mock-stub SDK for the PEMRIX network.

```bash
pip install -e .
```

```python
import asyncio
from pemrix import FaucetClient, ExplorerClient, WebhookClient

async def main():
    faucet = FaucetClient("http://127.0.0.1:60101")
    explorer = ExplorerClient("http://127.0.0.1:60102")
    webhooks = WebhookClient("http://127.0.0.1:60103")

asyncio.run(main())
```
