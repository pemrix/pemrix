#!/usr/bin/env bash
#
# PEMRIX Cloudflare DNS Setup Template
#
# Creates DNS records for PEMRIX services and enables Cloudflare proxying.
# Run this after updating CLOUDFLARE_API_TOKEN and PEMRIX_DOMAIN below, or
# export them as environment variables.
#
# Usage:
#   export CLOUDFLARE_API_TOKEN="your-token"
#   export PEMRIX_DOMAIN="pemrix.com"
#   export SERVER_IP="203.0.113.10"
#   ./scripts/cloudflare-setup.sh

set -euo pipefail

CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
PEMRIX_DOMAIN="${PEMRIX_DOMAIN:-pemrix.com}"
SERVER_IP="${SERVER_IP:-}"

if [[ -z "$CLOUDFLARE_API_TOKEN" ]]; then
  echo "Error: CLOUDFLARE_API_TOKEN is not set."
  exit 1
fi

if [[ -z "$SERVER_IP" ]]; then
  echo "Error: SERVER_IP is not set."
  exit 1
fi

CF_API="https://api.cloudflare.com/client/v4"
AUTH_HEADER="Authorization: Bearer $CLOUDFLARE_API_TOKEN"

cf_get_zone_id() {
  local domain="$1"
  curl -s -X GET "$CF_API/zones?name=$domain" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json" | \
    python3 -c "import sys,json; print(json.load(sys.stdin)['result'][0]['id'])"
}

cf_create_or_update_record() {
  local zone_id="$1"
  local name="$2"
  local type="$3"
  local content="$4"
  local proxied="$5"

  echo "Creating/updating $name -> $content (proxied=$proxied)"
  curl -s -X POST "$CF_API/zones/$zone_id/dns_records" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"$type\",\"name\":\"$name\",\"content\":\"$content\",\"proxied\":$proxied,\"ttl\":1}" > /dev/null
}

ZONE_ID=$(cf_get_zone_id "$PEMRIX_DOMAIN")
echo "Zone ID for $PEMRIX_DOMAIN: $ZONE_ID"

# Apex domain and key subdomains. Adjust as needed.
cf_create_or_update_record "$ZONE_ID" "$PEMRIX_DOMAIN" A "$SERVER_IP" true
cf_create_or_update_record "$ZONE_ID" "docs.$PEMRIX_DOMAIN" A "$SERVER_IP" true
cf_create_or_update_record "$ZONE_ID" "rpc.$PEMRIX_DOMAIN" A "$SERVER_IP" true
cf_create_or_update_record "$ZONE_ID" "explorer.$PEMRIX_DOMAIN" A "$SERVER_IP" true
cf_create_or_update_record "$ZONE_ID" "faucet.$PEMRIX_DOMAIN" A "$SERVER_IP" true

echo "Cloudflare DNS records created. It may take a few minutes for proxying to activate."
