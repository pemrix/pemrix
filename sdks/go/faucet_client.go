package pemrix

// FaucetResponse represents a faucet request response.
type FaucetResponse struct {
	Success bool   `json:"success"`
	TxHash  string `json:"tx_hash"`
	Message string `json:"message"`
}

// FaucetClient requests test tokens from a PEMRIX faucet.
type FaucetClient struct {
	BaseURL string
}

// NewFaucetClient creates a new faucet client.
func NewFaucetClient(baseURL string) *FaucetClient {
	return &FaucetClient{BaseURL: baseURL}
}

// Request submits a token request to the faucet.
func (c *FaucetClient) Request(address, amount string) (*FaucetResponse, error) {
	return &FaucetResponse{
		Success: true,
		TxHash:  "mock",
		Message: "mock faucet response",
	}, nil
}
