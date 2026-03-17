#!/usr/bin/env bash
set -euo pipefail

# One-shot deploy script for Ubuntu 24.04 + Docker + Caddy
# Target repo: TeklemariamA/motoko-the-civic-os--2-
# Default branch: copilot/ssh-deploy-from-main
# Domain: civic-os-opensourcism.cloud

REPO_URL="${REPO_URL:-https://github.com/TeklemariamA/motoko-the-civic-os--2-.git}"
BRANCH="${BRANCH:-copilot/ssh-deploy-from-main}"
APP_DIR="${APP_DIR:-$HOME/apps/motoko-the-civic-os--2-}"
DOMAIN="${DOMAIN:-civic-os-opensourcism.cloud}"
WWW_DOMAIN="${WWW_DOMAIN:-www.civic-os-opensourcism.cloud}"
EXPECTED_IP="${EXPECTED_IP:-72.61.96.166}"

log() {
  echo "[deploy] $*"
}

require_root_sudo() {
  if ! command -v sudo >/dev/null 2>&1; then
    echo "sudo is required" >&2
    exit 1
  fi
}

install_docker_ubuntu() {
  log "Installing Docker Engine and Compose plugin on Ubuntu..."
  sudo apt-get update -y
  sudo apt-get install -y ca-certificates curl gnupg git

  sudo install -m 0755 -d /etc/apt/keyrings
  if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
  fi

  UBUNTU_CODENAME="$(. /etc/os-release && echo "$VERSION_CODENAME")"
  ARCH="$(dpkg --print-architecture)"

  echo "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME} stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  sudo systemctl enable docker
  sudo systemctl start docker

  if ! groups "$USER" | grep -q '\bdocker\b'; then
    sudo usermod -aG docker "$USER"
    log "Added $USER to docker group. You may need to re-login after this run."
  fi
}

prepare_repo() {
  log "Preparing application repository at ${APP_DIR}..."
  mkdir -p "$(dirname "$APP_DIR")"

  if [[ ! -d "$APP_DIR/.git" ]]; then
    git clone "$REPO_URL" "$APP_DIR"
  fi

  cd "$APP_DIR"
  git fetch --all --prune
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
}

deploy_stack() {
  log "Deploying Docker Compose stack..."
  cd "$APP_DIR"

  # Use sudo for first run reliability in fresh hosts.
  sudo docker compose down || true
  sudo docker compose up -d --build
  sudo docker compose ps
}

configure_firewall() {
  log "Configuring firewall (UFW) for SSH/HTTP/HTTPS..."
  sudo apt-get install -y ufw
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw --force enable
  sudo ufw status
}

check_dns() {
  log "Checking DNS resolution for ${DOMAIN} and ${WWW_DOMAIN}..."
  DOMAIN_IP="$(getent hosts "$DOMAIN" | awk '{print $1}' | head -n1 || true)"
  WWW_IP="$(getent hosts "$WWW_DOMAIN" | awk '{print $1}' | head -n1 || true)"

  echo "${DOMAIN} -> ${DOMAIN_IP:-<no record>}"
  echo "${WWW_DOMAIN} -> ${WWW_IP:-<no record>}"

  if [[ "${DOMAIN_IP:-}" != "$EXPECTED_IP" || "${WWW_IP:-}" != "$EXPECTED_IP" ]]; then
    log "WARNING: DNS does not match expected IP ${EXPECTED_IP}."
    log "Set A records to ${EXPECTED_IP} for both ${DOMAIN} and ${WWW_DOMAIN}."
  else
    log "DNS matches expected server IP ${EXPECTED_IP}."
  fi
}

verify_http() {
  log "Verifying HTTP/HTTPS endpoints..."
  set +e
  curl -I --max-time 20 "http://${DOMAIN}"
  curl -I --max-time 20 "https://${DOMAIN}"
  set -e
}

main() {
  require_root_sudo
  check_dns
  install_docker_ubuntu
  prepare_repo
  deploy_stack
  configure_firewall
  verify_http
  log "Deployment flow completed."
}

main "$@"
