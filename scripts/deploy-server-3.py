#!/usr/bin/env python3
#
# PEMRIX Server-3 Deployment Script
#
# Deploys PEMRIX validator and supporting services to Server-3.
# Uses the existing SSH alias `pegus-s3` (ProxyJump via pegus-s1) defined
# in ~/.ssh/config, so no root password is required.
#
# Required environment variables (or .env file next to this script):
#   PEMRIX_DOMAIN       Base domain (default: pemrix.com)
#
# Optional:
#   SERVER3_SSH_HOST    SSH host alias (default: pegus-s3)
#   PEMRIX_DATA_DIR     Data directory (default: /var/lib/pemrix)
#   PEMRIX_SOURCE_DIR   Source directory on server (default: /opt/pemrix)
#   PEMRIX_TESTNET_MODE Run as private testnet (default: true)

import os
import subprocess
import sys
from pathlib import Path

SERVER3_SSH_HOST = os.environ.get("SERVER3_SSH_HOST", "pegus-s3")
PEMRIX_DOMAIN = os.environ.get("PEMRIX_DOMAIN", "pemrix.com")
PEMRIX_DATA_DIR = os.environ.get("PEMRIX_DATA_DIR", "/var/lib/pemrix")
PEMRIX_SOURCE_DIR = os.environ.get("PEMRIX_SOURCE_DIR", "/opt/pemrix")
PEMRIX_TESTNET_MODE = os.environ.get("PEMRIX_TESTNET_MODE", "true")

SCRIPT_DIR = Path(__file__).parent.resolve()
SETUP_SCRIPT = SCRIPT_DIR / "setup-pemrix-server.sh"
SYSTEMD_DIR = SCRIPT_DIR.parent / "systemd"


def load_env():
    env_file = SCRIPT_DIR / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def run(cmd, check=True):
    print(f"$ {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)
    if check and result.returncode != 0:
        print(f"ERROR: command failed with exit code {result.returncode}", file=sys.stderr)
        sys.exit(result.returncode)
    return result


def ssh(cmd, check=True):
    return run(["ssh", "-o", "StrictHostKeyChecking=no", SERVER3_SSH_HOST, cmd], check=check)


def scp(local, remote, check=True):
    return run(["scp", "-o", "StrictHostKeyChecking=no", str(local), f"{SERVER3_SSH_HOST}:{remote}"], check=check)


def check_connection():
    print(f"[SERVER-3] Checking SSH alias '{SERVER3_SSH_HOST}'...")
    result = ssh("echo 'SSH connection OK'", check=False)
    if result.returncode != 0:
        print(f"ERROR: cannot connect to {SERVER3_SSH_HOST}. Ensure ~/.ssh/config has the host alias.")
        sys.exit(1)


def upload_files():
    remote_script = "/root/setup-pemrix-server.sh"
    scp(SETUP_SCRIPT, remote_script)
    ssh(f"chmod +x {remote_script}")

    remote_systemd = "/root/pemrix-systemd"
    ssh(f"mkdir -p {remote_systemd}")
    for f in SYSTEMD_DIR.iterdir():
        if f.is_file():
            scp(f, f"{remote_systemd}/{f.name}")
    print("[SERVER-3] Uploaded setup script and systemd files.")


def run_setup():
    env = (
        f"PEMRIX_DOMAIN={PEMRIX_DOMAIN} "
        f"PEMRIX_DATA_DIR={PEMRIX_DATA_DIR} "
        f"PEMRIX_SOURCE_DIR={PEMRIX_SOURCE_DIR} "
        f"PEMRIX_TESTNET_MODE={PEMRIX_TESTNET_MODE} "
        f"INSTALL_SERVICE=true"
    )
    cmd = f"{env} bash /root/setup-pemrix-server.sh"
    print("[SERVER-3] Running setup (this may take several minutes)...")
    ssh(cmd)


def main():
    load_env()
    check_connection()
    upload_files()
    run_setup()
    print("[SERVER-3] PEMRIX deployment complete.")


if __name__ == "__main__":
    main()
