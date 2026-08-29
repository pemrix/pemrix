# PEMRIX Go SDK

Mock-stub SDK for the PEMRIX network.

```bash
go build ./...
```

```go
package main

import (
    "fmt"
    pemrix "github.com/pemrix/pemrix-go-sdk"
)

func main() {
    faucet := pemrix.NewFaucetClient("http://127.0.0.1:60101")
    resp, _ := faucet.Request("px...", "1000")
    fmt.Println(resp.Message)
}
```
