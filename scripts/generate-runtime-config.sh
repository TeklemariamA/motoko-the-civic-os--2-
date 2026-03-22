#!/bin/sh
set -eu

RUNTIME_CONFIG_FILE="/usr/share/nginx/html/runtime-config.js"

DFX_NETWORK="${DFX_NETWORK:-ic}"
IC_HOST_DEFAULT="https://icp-api.io"
if [ "$DFX_NETWORK" != "ic" ]; then
  IC_HOST_DEFAULT="http://127.0.0.1:4943"
fi
IC_HOST="${IC_HOST:-$IC_HOST_DEFAULT}"
CANISTER_ID_BACKEND="${CANISTER_ID_BACKEND:-${CANISTER_ID:-}}"
ENABLE_CHATBOT="${ENABLE_CHATBOT:-false}"
CHAT_ENDPOINT="${CHAT_ENDPOINT:-https://civic-os-opensourcism.cloud/chat}"

cat > "$RUNTIME_CONFIG_FILE" <<EOF
// Generated at container startup. Override via container env vars.
window.CIVIC_OS_CONFIG = {
  CANISTER_ID_BACKEND: "$CANISTER_ID_BACKEND",
  DFX_NETWORK: "$DFX_NETWORK",
  IC_HOST: "$IC_HOST",
  CHAT_ENDPOINT: "$CHAT_ENDPOINT",
  ENABLE_CHATBOT: "$ENABLE_CHATBOT"
};
EOF
