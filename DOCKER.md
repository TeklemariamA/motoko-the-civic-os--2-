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
