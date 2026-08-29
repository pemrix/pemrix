# PEMRIX TypeScript SDK

Mock-stub SDK for the PEMRIX network.

```bash
npm install
npm run build
```

```typescript
import { FaucetClient, ExplorerClient, WebhookClient } from "./src";

const faucet = new FaucetClient("http://127.0.0.1:60101");
const explorer = new ExplorerClient("http://127.0.0.1:60102");
const webhooks = new WebhookClient("http://127.0.0.1:60103");
```
