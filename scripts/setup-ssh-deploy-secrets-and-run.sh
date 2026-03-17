#!/usr/bin/env bash
set -euo pipefail

REPO="TeklemariamA/motoko-the-civic-os--2-"
WORKFLOW_FILE="ssh-deploy-compose.yml"
DEFAULT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'copilot/ssh-deploy-from-main')"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required. Install it first."
  exit 1
fi

cat <<'MSG'
This script helps you complete:
1) Set required GitHub Actions secrets for SSH deploy
2) Trigger the SSH deploy workflow

You need a GitHub PAT with repo admin rights for secrets/actions writes.
MSG

read -r -p "Repository [${REPO}]: " INPUT_REPO
if [[ -n "${INPUT_REPO}" ]]; then
  REPO="${INPUT_REPO}"
fi

read -r -p "Deploy host (DEPLOY_HOST): " DEPLOY_HOST
read -r -p "Deploy user (DEPLOY_USER): " DEPLOY_USER
read -r -p "Deploy path on server (DEPLOY_PATH): " DEPLOY_PATH
read -r -p "Deploy port (DEPLOY_PORT, default 22): " DEPLOY_PORT
DEPLOY_PORT="${DEPLOY_PORT:-22}"
read -r -p "Healthcheck URL after deploy (optional, e.g. https://civic-os-opensourcism.cloud): " DEPLOY_HEALTHCHECK_URL

read -r -p "Path to private SSH key for deploy user (DEPLOY_SSH_PRIVATE_KEY): " KEY_PATH
if [[ ! -f "${KEY_PATH}" ]]; then
  echo "Key file not found: ${KEY_PATH}"
  exit 1
fi

read -r -p "Branch to deploy (default ${DEFAULT_BRANCH}): " BRANCH
BRANCH="${BRANCH:-$DEFAULT_BRANCH}"
read -r -p "Skip build by default? (true/false, default false): " SKIP_BUILD
SKIP_BUILD="${SKIP_BUILD:-false}"

echo ""
echo "Setting repository secrets on ${REPO}..."
printf "%s" "${DEPLOY_HOST}" | gh secret set DEPLOY_HOST -R "${REPO}" -b-
printf "%s" "${DEPLOY_USER}" | gh secret set DEPLOY_USER -R "${REPO}" -b-
printf "%s" "${DEPLOY_PATH}" | gh secret set DEPLOY_PATH -R "${REPO}" -b-
printf "%s" "${DEPLOY_PORT}" | gh secret set DEPLOY_PORT -R "${REPO}" -b-
printf "%s" "${SKIP_BUILD}" | gh secret set DEPLOY_SKIP_BUILD -R "${REPO}" -b-
if [[ -n "${DEPLOY_HEALTHCHECK_URL}" ]]; then
  printf "%s" "${DEPLOY_HEALTHCHECK_URL}" | gh secret set DEPLOY_HEALTHCHECK_URL -R "${REPO}" -b-
fi
gh secret set DEPLOY_SSH_PRIVATE_KEY -R "${REPO}" < "${KEY_PATH}"

echo ""
echo "Dispatching workflow ${WORKFLOW_FILE}..."
gh workflow run "${WORKFLOW_FILE}" -R "${REPO}" --ref "${BRANCH}"

echo ""
echo "Recent workflow runs:"
gh run list -R "${REPO}" --workflow "${WORKFLOW_FILE}" --limit 3

echo ""
echo "Done. Watch the latest run in GitHub Actions UI or use:"
echo "  gh run watch -R ${REPO}"
