#!/usr/bin/env bash
#
# PEMRIX Validator Setup Script
#
# This script installs the PEMRIX validator node and supporting services on a
# Linux server. By default it downloads pre-built release binaries from GitHub
# Releases. Use --build to compile from source instead.
#
# Usage:
#   ./scripts/install-validator.sh [--data-dir /var/lib/pemrix] [--service] [--build]
#
# Requirements:
#   - Ubuntu 22.04 LTS or compatible Linux distribution
#   - Root or sudo access (for system service)
#   - Internet connection
#
# NOTE: This script does NOT use Docker. Services run as native systemd units.

set -euo pipefail

DATA_DIR="/var/lib/pemrix"
INSTALL_SERVICE=false
BUILD_FROM_SOURCE=false
REPO_URL="https://github.com/pemrix/pemrix.git"
INSTALL_DIR="/opt/pemrix"
SERVICE_USER="pemrix"
BIN_DIR="/usr/local/bin"
RELEASE_URL="https://github.com/pemrix/pemrix/releases/latest/download/pemrix-linux-x86_64.tar.gz"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --data-dir)
      DATA_DIR="$2"
      shift 2
      ;;
    --service)
      INSTALL_SERVICE=true
      shift
      ;;
    --build)
      BUILD_FROM_SOURCE=true
      shift
      ;;
    --help)
      echo "Usage: $0 [--data-dir /var/lib/pemrix] [--service] [--build]"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--data-dir /var/lib/pemrix] [--service] [--build]"
      exit 1
      ;;
  esac
done

log() {
  echo "[pemrix-validator] $1"
}

check_requirements() {
  log "Checking requirements..."
  if [[ "$EUID" -ne 0 && "$INSTALL_SERVICE" == "true" ]]; then
    echo "Error: --service requires root privileges."
    exit 1
  fi

  if ! command -v curl &>/dev/null; then
    log "Installing curl..."
    apt-get update && apt-get install -y curl
  fi

  if [[ "$BUILD_FROM_SOURCE" == "true" ]]; then
    if ! command -v git &>/dev/null; then
      log "Installing git..."
      apt-get update && apt-get install -y git
    fi

    # Build dependencies for RocksDB.
    if ! command -v clang &>/dev/null && ! command -v gcc &>/dev/null; then
      log "Installing build dependencies..."
      apt-get update && apt-get install -y build-essential clang pkg-config libssl-dev
    fi

    if ! command -v cargo &>/dev/null; then
      log "Rust not found. Installing Rust via rustup..."
      curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
      source "$HOME/.cargo/env"
    fi
  fi
}

download_binaries() {
  log "Downloading latest PEMRIX Linux x86_64 release..."
  local tmpdir
  tmpdir=$(mktemp -d)
  curl -fsSL "$RELEASE_URL" -o "$tmpdir/pemrix-linux-x86_64.tar.gz"
  tar -xzf "$tmpdir/pemrix-linux-x86_64.tar.gz" -C "$tmpdir"
  cp -f "$tmpdir/pemrix-linux-x86_64/pemrix" "$BIN_DIR/pemrix"
  cp -f "$tmpdir/pemrix-linux-x86_64/pemrix-node" "$BIN_DIR/pemrix-node"
  cp -f "$tmpdir/pemrix-linux-x86_64/pemrix-explorer" "$BIN_DIR/pemrix-explorer"
  cp -f "$tmpdir/pemrix-linux-x86_64/pemrix-faucet" "$BIN_DIR/pemrix-faucet"
  cp -f "$tmpdir/pemrix-linux-x86_64/pemrix-webhook-worker" "$BIN_DIR/pemrix-webhook-worker"
  chmod +x "$BIN_DIR"/pemrix*
  rm -rf "$tmpdir"
  log "Binaries installed from release."
}

build_pemrix() {
  log "Building PEMRIX release binaries from source..."
  if [[ -d "$INSTALL_DIR" ]]; then
    log "Updating existing installation at $INSTALL_DIR"
    cd "$INSTALL_DIR"
    git pull
  else
    log "Cloning PEMRIX repository..."
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  fi

  cargo build --release
  log "Build complete."
}

install_binaries() {
  log "Installing binaries to $BIN_DIR..."
  if [[ "$BUILD_FROM_SOURCE" == "true" ]]; then
    cp -f "$INSTALL_DIR/target/release/pemrix" "$BIN_DIR/pemrix"
    cp -f "$INSTALL_DIR/target/release/pemrix-node" "$BIN_DIR/pemrix-node"
    cp -f "$INSTALL_DIR/target/release/pemrix-explorer" "$BIN_DIR/pemrix-explorer"
    cp -f "$INSTALL_DIR/target/release/pemrix-faucet" "$BIN_DIR/pemrix-faucet"
    cp -f "$INSTALL_DIR/target/release/pemrix-webhook-worker" "$BIN_DIR/pemrix-webhook-worker"
  fi
  chmod +x "$BIN_DIR"/pemrix*
}

install_or_build() {
  if [[ "$BUILD_FROM_SOURCE" == "true" ]]; then
    build_pemrix
  else
    download_binaries
  fi
}

create_user() {
  if ! id "$SERVICE_USER" &>/dev/null; then
    log "Creating system user $SERVICE_USER..."
    useradd --system --no-create-home --home-dir "$DATA_DIR" "$SERVICE_USER"
  fi
}

initialize_validator() {
  log "Initializing validator data directory at $DATA_DIR..."
  mkdir -p "$DATA_DIR"
  "$BIN_DIR/pemrix" init --validator --data-dir "$DATA_DIR"

  log "Setting permissions..."
  chown -R "$SERVICE_USER:$SERVICE_USER" "$DATA_DIR"
  chmod 700 "$DATA_DIR"
}

install_systemd_services() {
  log "Installing systemd services..."
  create_user

  cp -f "$INSTALL_DIR/systemd/pemrix-validator.service" /etc/systemd/system/pemrix-validator.service
  cp -f "$INSTALL_DIR/systemd/pemrix-explorer.service" /etc/systemd/system/pemrix-explorer.service
  cp -f "$INSTALL_DIR/systemd/pemrix-faucet.service" /etc/systemd/system/pemrix-faucet.service
  cp -f "$INSTALL_DIR/systemd/pemrix-webhooks.service" /etc/systemd/system/pemrix-webhooks.service

  # Replace placeholders in case a non-default data dir was chosen.
  if [[ "$DATA_DIR" != "/var/lib/pemrix" ]]; then
    sed -i "s|/var/lib/pemrix|$DATA_DIR|g" /etc/systemd/system/pemrix-*.service
  fi

  systemctl daemon-reload
  log "Systemd services installed."
}

print_summary() {
  echo
  echo "=========================================="
  echo " PEMRIX Validator Setup Complete"
  echo "=========================================="
  echo "Binaries:   $BIN_DIR/pemrix*"
  echo "Data dir:   $DATA_DIR"
  echo "Key file:   $DATA_DIR/validator_key.json"
  echo
  echo "Next steps:"
  echo "  1. Backup $DATA_DIR/validator_key.json in a secure offline location."
  echo "  2. Fund the validator address with the minimum required stake."
  echo "  3. Configure bootstrap peers in $DATA_DIR/node.json."
  echo "  4. Start the validator:"
  if [[ "$INSTALL_SERVICE" == "true" ]]; then
    echo "     systemctl enable --now pemrix-validator"
    echo "     systemctl enable --now pemrix-explorer"
    echo "     systemctl enable --now pemrix-faucet"
    echo "     systemctl enable --now pemrix-webhooks"
    echo "     journalctl -u pemrix-validator -f"
  else
    echo "     $BIN_DIR/pemrix start --validator --data-dir $DATA_DIR"
  fi
  echo
  echo "Validator address:"
  grep '"address"' "$DATA_DIR/validator_key.json" | sed 's/.*: "\(.*\)",/\1/'
  echo "=========================================="
}

main() {
  check_requirements
  install_or_build
  install_binaries
  initialize_validator
  if [[ "$INSTALL_SERVICE" == "true" ]]; then
    install_systemd_services
  fi
  print_summary
}

main "$@"
