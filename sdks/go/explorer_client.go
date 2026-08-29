package pemrix

// ExplorerStatus represents the indexed chain status.
type ExplorerStatus struct {
	Height            uint64 `json:"height"`
	TransactionCount  int    `json:"transaction_count"`
	AccountCount      int    `json:"account_count"`
}

// ExplorerAccount represents an indexed account.
type ExplorerAccount struct {
	Address string `json:"address"`
	Balance string `json:"balance"`
	Nonce   uint64 `json:"nonce"`
}

// ExplorerClient queries blockchain data from a PEMRIX explorer.
type ExplorerClient struct {
	BaseURL string
}

// NewExplorerClient creates a new explorer client.
func NewExplorerClient(baseURL string) *ExplorerClient {
	return &ExplorerClient{BaseURL: baseURL}
}

// Status returns the explorer status.
func (c *ExplorerClient) Status() (*ExplorerStatus, error) {
	return &ExplorerStatus{Height: 0, TransactionCount: 0, AccountCount: 0}, nil
}

// BlockByHeight returns a block by height.
func (c *ExplorerClient) BlockByHeight(height uint64) (interface{}, error) {
	return nil, nil
}

// Transaction returns a transaction by hash.
func (c *ExplorerClient) Transaction(hash string) (interface{}, error) {
	return nil, nil
}

// Account returns an account by address.
func (c *ExplorerClient) Account(address string) (*ExplorerAccount, error) {
	return nil, ErrMockExplorer
}
