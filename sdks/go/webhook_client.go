package pemrix

import "errors"

// WebhookEventType identifies the type of webhook event.
type WebhookEventType string

const (
	BlockEvent                WebhookEventType = "block"
	TransactionEvent          WebhookEventType = "transaction"
	TransactionConfirmedEvent WebhookEventType = "transaction_confirmed"
)

// SubscriptionResponse represents a webhook subscription.
type SubscriptionResponse struct {
	ID     string             `json:"id"`
	URL    string             `json:"url"`
	Events []WebhookEventType `json:"events"`
	Secret string             `json:"secret"`
}

// WebhookClient manages webhook subscriptions.
type WebhookClient struct {
	BaseURL string
}

// NewWebhookClient creates a new webhook client.
func NewWebhookClient(baseURL string) *WebhookClient {
	return &WebhookClient{BaseURL: baseURL}
}

// Subscribe registers a new webhook subscription.
func (c *WebhookClient) Subscribe(url string, events []WebhookEventType) (*SubscriptionResponse, error) {
	return &SubscriptionResponse{
		ID:     "mock-id",
		URL:    url,
		Events: events,
		Secret: "mock-secret",
	}, nil
}

// ErrMockExplorer is returned by mock explorer clients.
var ErrMockExplorer = errors.New("mock explorer client")
