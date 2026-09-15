#!/usr/bin/env bash
set -euo pipefail

CANISTER_ID="${CANISTER_ID_BACKEND_IC:-jip23-gaaaa-aaaak-qyzpq-cai}"
NETWORK="${DFX_NETWORK:-ic}"
WASM_PATH=".dfx/local/canisters/backend/backend.wasm"

if ! command -v dfx >/dev/null 2>&1; then
  echo "Error: dfx is not installed or not in PATH" >&2
  exit 1
fi

echo "Using identity: $(dfx identity whoami)"
echo "Target network: ${NETWORK}"
echo "Target canister: ${CANISTER_ID}"

dfx canister --network "${NETWORK}" info "${CANISTER_ID}" >/dev/null

echo "Building backend canister..."
dfx build backend

if [[ ! -f "${WASM_PATH}" ]]; then
  echo "Error: expected wasm not found at ${WASM_PATH}" >&2
  exit 1
fi

echo "Upgrading backend canister on ${NETWORK}..."
dfx canister --network "${NETWORK}" install \
  --mode upgrade \
  --wasm-memory-persistence replace \
  --wasm "${WASM_PATH}" \
  "${CANISTER_ID}"

echo "Deployment complete. Verifying..."
dfx canister --network "${NETWORK}" info "${CANISTER_ID}"
