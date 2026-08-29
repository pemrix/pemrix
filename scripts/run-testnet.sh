#!/usr/bin/env bash
set -euo pipefail

# Run the PEMRIX local testnet natively (no containers).
#
# Usage:
#   ./scripts/run-testnet.sh
#   PEMRIX_BIND_HOST=0.0.0.0 ./scripts/run-testnet.sh
#   ./scripts/run-testnet.sh --release

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

export PEMRIX_DATA_DIR="${PEMRIX_DATA_DIR:-${ROOT_DIR}/pemrix-testnet-data}"
export PEMRIX_BIND_HOST="${PEMRIX_BIND_HOST:-127.0.0.1}"

BUILD_MODE="${1:-debug}"

echo "PEMRIX local testnet runner"
echo "  Data directory: ${PEMRIX_DATA_DIR}"
echo "  Bind host:      ${PEMRIX_BIND_HOST}"
echo "  Build mode:     ${BUILD_MODE}"

if [[ "${BUILD_MODE}" == "--release" || "${BUILD_MODE}" == "release" ]]; then
    cargo build --release --bin pemrix
    BINARY="${ROOT_DIR}/target/release/pemrix"
else
    cargo build --bin pemrix
    BINARY="${ROOT_DIR}/target/debug/pemrix"
fi

echo "Starting testnet..."
exec "${BINARY}" testnet --data-dir "${PEMRIX_DATA_DIR}"
