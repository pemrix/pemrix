#!/usr/bin/env bash
#
# PEMRIX Validator Setup Script
#
# This script installs the PEMRIX validator node on a Linux server.
# It builds the release binary, initializes a validator data directory,
# and optionally creates a systemd service.
#
# Usage:
#   ./scripts/install-validator.sh [--data-dir /var/lib/pemrix] [--service]
#
# Requirements:
#   - Ubuntu 22.04 LTS or compatible Linux distribution
#   - Root or sudo access (for system service)
#   - Internet connection

set -euo pipefail

DATA_DIR="/var/lib/pemrix"
INSTALL_SERVICE=false
REPO_URL="https://github.com/pemrix/pemrix.git"
INSTALL_DIR="/opt/pemrix"
SERVICE_USER="pemrix"

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
    --help)
      echo "Usage: $0 [--data-dir /var/lib/pemrix] [--service]"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--data-dir /var/lib/pemrix] [--service]"
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

  if ! command -v git &>/dev/null; then
    log "Installing git..."
    apt-get update && apt-get install -y git
  fi

  if ! command -v cargo &>/dev/null; then
    log "Rust not found. Installing Rust via rustup..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
  fi
}

build_pemrix() {
  log "Building PEMRIX release binary..."
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
  log "Build complete: $INSTALL_DIR/target/release/pemrix"
}

initialize_validator() {
  log "Initializing validator data directory at $DATA_DIR..."
  mkdir -p "$DATA_DIR"
  "$INSTALL_DIR/target/release/pemrix" init --validator --data-dir "$DATA_DIR"

  log "Setting permissions..."
  if id "$SERVICE_USER" &>/dev/null; then
    chown -R "$SERVICE_USER:$SERVICE_USER" "$DATA_DIR"
  else
    log "Warning: user $SERVICE_USER does not exist. Skipping ownership change."
  fi
}

install_systemd_service() {
  log "Creating systemd service..."

  if ! id "$SERVICE_USER" &>/dev/null; then
    useradd --system --no-create-home --home-dir "$DATA_DIR" "$SERVICE_USER"
  fi

  cat > /etc/systemd/system/pemrix-validator.service <<EOF
[Unit]
Description=PEMRIX Validator Node
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$DATA_DIR
ExecStart=$INSTALL_DIR/target/release/pemrix start --validator --data-dir $DATA_DIR
Restart=always
RestartSec=5

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DATA_DIR

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  log "Systemd service installed. Enable with: systemctl enable --now pemrix-validator"
}

print_summary() {
  echo
  echo "=========================================="
  echo " PEMRIX Validator Setup Complete"
  echo "=========================================="
  echo "Binary:     $INSTALL_DIR/target/release/pemrix"
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
    echo "     journalctl -u pemrix-validator -f"
  else
    echo "     $INSTALL_DIR/target/release/pemrix start --validator --data-dir $DATA_DIR"
  fi
  echo
  echo "Validator address:"
  cat "$DATA_DIR/validator_key.json" | grep '"address"' | sed 's/.*: "\(.*\)",/\1/'
  echo "=========================================="
}

main() {
  check_requirements
  build_pemrix
  initialize_validator
  if [[ "$INSTALL_SERVICE" == "true" ]]; then
    install_systemd_service
  fi
  print_summary
}

main "$@"
