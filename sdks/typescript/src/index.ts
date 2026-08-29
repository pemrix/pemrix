export interface FaucetResponse {
  success: boolean;
  tx_hash: string;
  message: string;
}

export class FaucetClient {
  constructor(private baseUrl: string) {}

  async request(address: string, amount: string): Promise<FaucetResponse> {
    return {
      success: true,
      tx_hash: "mock",
      message: "mock faucet response",
    };
  }
}

export interface ExplorerStatus {
  height: number;
  transaction_count: number;
  account_count: number;
}

export interface ExplorerAccount {
  address: string;
  balance: string;
  nonce: number;
}

export class ExplorerClient {
  constructor(private baseUrl: string) {}

  async status(): Promise<ExplorerStatus> {
    return { height: 0, transaction_count: 0, account_count: 0 };
  }

  async blockByHeight(height: number): Promise<unknown> {
    return null;
  }

  async transaction(hash: string): Promise<unknown> {
    return null;
  }

  async account(address: string): Promise<ExplorerAccount> {
    throw new Error("mock explorer client");
  }
}

export type WebhookEventType =
  | "block"
  | "transaction"
  | "transaction_confirmed";

export interface SubscriptionResponse {
  id: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
}

export class WebhookClient {
  constructor(private baseUrl: string) {}

  async subscribe(
    url: string,
    events: WebhookEventType[]
  ): Promise<SubscriptionResponse> {
    return {
      id: "mock-id",
      url,
      events,
      secret: "mock-secret",
    };
  }
}
