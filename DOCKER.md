# Docker Deployment Guide

This document describes how to build and deploy the CivicOS v2.0 application using Docker.

## Overview

The application is containerized using Docker and can be pushed to the GitHub Container Registry (ghcr.io).

## Files

- **Dockerfile**: Multi-stage Docker build for the FastAPI application
- **.dockerignore**: Excludes unnecessary files from the Docker build context
- **.github/workflows/docker-push.yml**: GitHub Actions workflow for automated builds and pushes

## Building Locally

To build the Docker image locally:

```bash
docker build -t civic-os:latest .
```

To run the container locally:

```bash
docker run -d -p 8000:8000 --name civic-os civic-os:latest
```

The API will be available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- API: http://localhost:8000

## Automated Deployment

The GitHub Actions workflow automatically builds and pushes the Docker image to GitHub Container Registry (ghcr.io) when:
- Changes are pushed to the `main` branch affecting:
  - `backend/**`
  - `Dockerfile`
  - `.github/workflows/docker-push.yml`
- Manually triggered via workflow dispatch

For direct server deployment, this repository also includes
`.github/workflows/ssh-deploy-compose.yml`, which SSH-deploys the compose stack
on pushes to the configured deployment branches.

### SSH Auto-Deploy Setup

Add these repository secrets before enabling automatic server deployments:

- `DEPLOY_HOST`: Hostname or IP of your server
- `DEPLOY_USER`: SSH user with access to the deployment directory
- `DEPLOY_SSH_PRIVATE_KEY`: Private key for `DEPLOY_USER`
- `DEPLOY_PATH`: Absolute path to this repo on the server
- `DEPLOY_PORT`: Optional SSH port (default `22`)
- `DEPLOY_HEALTHCHECK_URL`: Optional URL to verify after deploy, for example `https://civic-os-opensourcism.cloud`

The workflow executes this sequence on the server:

```bash
cd "$DEPLOY_PATH"
git fetch --all --prune
git checkout "$GITHUB_REF_NAME"
git pull origin "$GITHUB_REF_NAME"
docker compose up -d --build
docker compose ps
```

Recommended setup for this repository:

- Deploy branch: `copilot/ssh-deploy-from-main`
- Healthcheck URL: `https://civic-os-opensourcism.cloud`

After secrets are configured, any push to `copilot/ssh-deploy-from-main` that changes frontend, Docker, Caddy, scripts, or the deploy workflow will trigger a fresh deployment automatically.

### Authentication

The workflow uses the built-in `GITHUB_TOKEN` for authentication with GitHub Container Registry. No additional secrets need to be configured.

## Image Tags

The workflow creates the following tags:
- `latest`: Latest build from the main branch
- `main-<sha>`: Build from main branch with git SHA
- Branch name for non-main branches
- Semantic version tags (if using version tags)

## API Endpoints

The CivicOS v2.0 API provides:

### Bounty System
- `POST /bounties/create` - Create a new bounty
- `GET /bounties/{bounty_id}/current_value` - Get current bounty value

### ZK-Audit System
- `POST /audit/private_action` - Submit a private action with ZK proof
- `GET /audit/public_log` - View public audit log

### Justice System
- `POST /justice/file_case` - File a new case
- `POST /justice/cast_verdict` - Cast a verdict as a juror

## Healthcheck

The container includes a healthcheck that runs every 30 seconds to ensure the application is running.

## Environment Variables

The application can be configured using the following environment variables:
- `PORT`: Application port (default: 8000)
- Additional environment variables can be added as needed

## Docker Registry

The images are pushed to GitHub Container Registry: `ghcr.io/teklemariama/motoko-the-civic-os--2-`

To pull the latest image:

```bash
docker pull ghcr.io/teklemariama/motoko-the-civic-os--2-:latest
```

## Troubleshooting

### Domain not loading

If `https://civic-os-opensourcism.cloud` is not loading, check these in order:

1. DNS points to your server IP:
  ```bash
  dig +short civic-os-opensourcism.cloud
  dig +short www.civic-os-opensourcism.cloud
  ```
2. Ports 80 and 443 are open on your server/firewall.
3. The stack is running:
  ```bash
  docker compose ps
  ```
4. Caddy can reach the frontend container:
  ```bash
  docker compose logs --tail=200 caddy
  docker compose logs --tail=200 frontend
  ```

The repo includes a Caddy redirect from the typo domain
`civic-os-openssourcism.cloud` to the canonical
`civic-os-opensourcism.cloud`, but DNS must still exist for any host you want
to accept traffic for.

### Deploy/redeploy the web stack

From the project root on the target server:

```bash
docker compose down
docker compose up -d --build
docker compose logs -f caddy
```

Then verify:

```bash
curl -I http://civic-os-opensourcism.cloud
curl -I https://civic-os-opensourcism.cloud
```

If the build fails:
1. Check the GitHub Actions logs
2. Verify Docker registry credentials are correct
3. Ensure the Dockerfile syntax is valid
4. Check that all dependencies are available

For local testing:
```bash
# Build without cache
docker build --no-cache -t civic-os:latest .

# View container logs
docker logs civic-os

# Execute shell in running container
docker exec -it civic-os /bin/bash
```
