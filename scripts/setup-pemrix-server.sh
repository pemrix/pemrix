#!/bin/bash
#
# PEMRIX Server Setup Script
#
# Installs the PEMRIX validator node and supporting services on a Linux server.
# Designed to run on Server-3 (217.217.250.70) alongside existing Quanvio infra.
#
# This script does NOT use Docker. Services run as native systemd units.
#
# Environment variables:
#   PEMRIX_DOMAIN       Base domain (default: pemrix.com)
#   PEMRIX_DATA_DIR     Data directory (default: /var/lib/pemrix)
#   PEMRIX_SOURCE_DIR   Local source directory to build from (default: /opt/pemrix)
#   INSTALL_SERVICE     Set to "true" to install systemd services (default: true)
#   PEMRIX_BOOTSTRAP    Comma-separated bootstrap peers in <peer_id>@<host:port> form

set -euo pipefail

PEMRIX_DOMAIN="${PEMRIX_DOMAIN:-pemrix.com}"
PEMRIX_DATA_DIR="${PEMRIX_DATA_DIR:-/var/lib/pemrix}"
PEMRIX_SOURCE_DIR="${PEMRIX_SOURCE_DIR:-/opt/pemrix}"
INSTALL_SERVICE="${INSTALL_SERVICE:-true}"
PEMRIX_BOOTSTRAP="${PEMRIX_BOOTSTRAP:-}"
SERVICE_USER="pemrix"
BIN_DIR="/usr/local/bin"

echo "=========================================="
echo "PEMRIX Server Setup"
echo "Domain:        $PEMRIX_DOMAIN"
echo "Data dir:      $PEMRIX_DATA_DIR"
echo "Source dir:    $PEMRIX_SOURCE_DIR"
echo "Install service: $INSTALL_SERVICE"
echo "Bootstrap:     $PEMRIX_BOOTSTRAP"
echo "=========================================="

export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a
export NEEDRESTART_SUSPEND=1

# Update system
apt-get update
apt-get upgrade -y -q -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

# Install dependencies
apt-get install -y curl git build-essential clang pkg-config libssl-dev python3 python3-pip nginx

# Create pemrix user
if ! id "$SERVICE_USER" &>/dev/null; then
    useradd --system --no-create-home --home-dir "$PEMRIX_DATA_DIR" "$SERVICE_USER"
fi

# Install Rust if missing
if ! command -v cargo &>/dev/null; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# Ensure source directory exists
if [[ ! -d "$PEMRIX_SOURCE_DIR" ]]; then
    echo "Cloning PEMRIX source..."
    git clone https://github.com/pemrix/pemrix.git "$PEMRIX_SOURCE_DIR"
fi

cd "$PEMRIX_SOURCE_DIR"
git pull

# Build release binaries
echo "Building PEMRIX release binaries..."
cargo build --release

# Install binaries
cp -f "$PEMRIX_SOURCE_DIR/target/release/pemrix" "$BIN_DIR/pemrix"
cp -f "$PEMRIX_SOURCE_DIR/target/release/pemrix-node" "$BIN_DIR/pemrix-node"
cp -f "$PEMRIX_SOURCE_DIR/target/release/pemrix-explorer" "$BIN_DIR/pemrix-explorer"
cp -f "$PEMRIX_SOURCE_DIR/target/release/pemrix-faucet" "$BIN_DIR/pemrix-faucet"
cp -f "$PEMRIX_SOURCE_DIR/target/release/pemrix-webhook-worker" "$BIN_DIR/pemrix-webhook-worker"
chmod +x "$BIN_DIR"/pemrix*

# Initialize validator data directory if empty
mkdir -p "$PEMRIX_DATA_DIR"
if [[ ! -f "$PEMRIX_DATA_DIR/validator_key.json" ]]; then
    echo "Initializing PEMRIX validator..."
    "$BIN_DIR/pemrix" init --validator --data-dir "$PEMRIX_DATA_DIR"
fi

# Apply bootstrap peers if provided
if [[ -n "$PEMRIX_BOOTSTRAP" ]]; then
    echo "Configuring bootstrap peers: $PEMRIX_BOOTSTRAP"
    python3 - "$PEMRIX_DATA_DIR" "$PEMRIX_BOOTSTRAP" <<'PY'
import json, sys
data_dir, bootstrap_str = sys.argv[1], sys.argv[2]
node_path = f"{data_dir}/node.json"
with open(node_path) as f:
    config = json.load(f)
config["bootstrap_nodes"] = {}
for entry in bootstrap_str.split(","):
    peer_id, addr = entry.strip().split("@", 1)
    config["bootstrap_nodes"][peer_id] = addr
with open(node_path, "w") as f:
    json.dump(config, f, indent=2)
PY
fi

chown -R "$SERVICE_USER:$SERVICE_USER" "$PEMRIX_DATA_DIR"
chmod 700 "$PEMRIX_DATA_DIR"

# Install systemd services
if [[ "$INSTALL_SERVICE" == "true" ]]; then
    echo "Installing systemd services..."
    cp -f "$PEMRIX_SOURCE_DIR/systemd/pemrix-validator.service" /etc/systemd/system/pemrix-validator.service
    cp -f "$PEMRIX_SOURCE_DIR/systemd/pemrix-services.service" /etc/systemd/system/pemrix-services.service

    if [[ "$PEMRIX_DATA_DIR" != "/var/lib/pemrix" ]]; then
        sed -i "s|/var/lib/pemrix|$PEMRIX_DATA_DIR|g" /etc/systemd/system/pemrix-*.service
    fi

    systemctl daemon-reload
    systemctl enable --now pemrix-validator
    systemctl enable --now pemrix-services
fi

# Install NGINX config
if [[ -f "$PEMRIX_SOURCE_DIR/systemd/pemrix-nginx.conf" ]]; then
    echo "Installing NGINX config..."
    cp -f "$PEMRIX_SOURCE_DIR/systemd/pemrix-nginx.conf" /etc/nginx/sites-available/pemrix
    sed -i "s|__DOMAIN__|$PEMRIX_DOMAIN|g" /etc/nginx/sites-available/pemrix
    if [[ ! -L /etc/nginx/sites-enabled/pemrix ]]; then
        ln -s /etc/nginx/sites-available/pemrix /etc/nginx/sites-enabled/pemrix
    fi
    nginx -t && systemctl reload nginx
fi

echo "=========================================="
echo "PEMRIX Server Setup Complete"
echo "=========================================="
echo "Validator address:"
grep '"address"' "$PEMRIX_DATA_DIR/validator_key.json" | sed 's/.*: "\(.*\)",/\1/'
echo "Services: pemrix-validator, pemrix-services"
echo "=========================================="
