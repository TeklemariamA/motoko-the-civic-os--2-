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

## VPS Deployment (civic-os-opensourcism.cloud)

The `vps-deploy.yml` workflow automatically deploys to the Hostinger KVM VPS
(Ubuntu 24.04, `72.61.96.166`) after every successful image push to GHCR.

### Authentication overview — what uses what

| Purpose | Mechanism | Where it lives |
|---|---|---|
| Check out source code in CI | Built-in `GITHUB_TOKEN` | Automatic — no setup needed |
| Push Docker image to GHCR | Built-in `GITHUB_TOKEN` | Automatic — no setup needed |
| SSH into VPS to run `docker pull` | `VPS_SSH_KEY` repo secret | Settings → Secrets → Actions |
| **Deploy keys (SSH keys on the repo)** | **Not used** | **Not needed** |

### ✅ Deploy key cleanup — completed

No workflow in this repository uses deploy keys.  Both previously-listed keys
(`Hostinger Docker2` and `github-actions-deploy`) have been removed from
Settings → Security → Deploy keys.  The repository deploy key list is now
empty.

> To confirm, run **Actions → Audit and Remove Deploy Keys → Run workflow**
> with `delete_keys = false` — it should report "No deploy keys found".

**Why they are safe to delete:** The VPS deployment works by pulling a
pre-built Docker image (`docker pull ghcr.io/…`). The VPS never clones this
repository over SSH, so no deploy key is needed.

**Common mistake — adding the VPS key as a deploy key:**  
When you generate an SSH key pair on the VPS with a comment like
`github-actions-deploy`, it is tempting to upload the public key as a
repository deploy key on GitHub. However, a deploy key would only let the VPS
pull/push *the repository* over SSH — which this workflow never does.

What is actually needed:

| Where the key goes | Which half | Purpose |
|---|---|---|
| `VPS_SSH_KEY` GitHub Actions secret | **Private** key (`cat ~/.ssh/id_ed25519`) | Lets GitHub Actions SSH *into* the VPS |
| VPS `~/.ssh/authorized_keys` | **Public** key (`id_ed25519.pub`) | Lets the VPS accept that incoming SSH connection |
| GitHub repository deploy keys | *(not needed — leave empty)* | The VPS never SSH-clones the repo |

If you generated a new key pair but accidentally added the public key as a
deploy key instead (as happened with `github-actions-deploy` in Mar 2026 —
now corrected):

1. ~~**Delete** the deploy key~~ — **done ✓** (`github-actions-deploy` deleted
   14 Mar 2026).  For future incidents, use **Actions → Audit and Remove Deploy
   Keys → Run workflow** with `delete_keys = true`, or remove manually at
   Settings → Security → Deploy keys.
2. **Update** the `VPS_SSH_KEY` secret with the private key (step 3 below).
3. **Verify** the public key is in the VPS's `authorized_keys` (step 2 above).
4. **Confirm** the cleanup worked by re-running the workflow with
   `delete_keys = false` — it should report "No deploy keys found".

**What NOT to delete** — the `VPS_SSH_KEY` repository secret:

1. Go to `https://github.com/TeklemariamA/motoko-the-civic-os--2-/settings/secrets/actions`
2. Click **`VPS_SSH_KEY`** in the list.
3. Click **Update** (not Delete — updating replaces the value in place).
4. Paste the complete private key retrieved from your VPS (see step 1 below).
5. Click **Save changes**.

> **Do NOT delete keys from your GitHub account** (`github.com → Settings →
> SSH and GPG keys`). Those are your personal Git access keys and are
> completely separate from this deployment.

---

### One-time VPS setup

#### 1. Obtain (or generate) a private key on the VPS

First, check what keys are already present:

```bash
ssh root@72.61.96.166 "ls -la ~/.ssh/"
```

**Case A — a key file already exists** (`id_ed25519`, `id_rsa`, or `id_ecdsa`):

```bash
ssh root@72.61.96.166 "cat ~/.ssh/id_ed25519"   # preferred
# or
ssh root@72.61.96.166 "cat ~/.ssh/id_rsa"
# or
ssh root@72.61.96.166 "cat ~/.ssh/id_ecdsa"
```

Copy the full output (including the `-----BEGIN` / `-----END` lines) — you will
paste it into GitHub Secrets in step 3.

**Case B — no key files exist** (you see output like
`cat: /root/.ssh/id_ed25519: No such file or directory`):

Generate a new key pair directly on the VPS:

```bash
ssh root@72.61.96.166 \
  "ssh-keygen -t ed25519 -C 'github-actions-deploy' -N '' -f ~/.ssh/id_ed25519"
```

> **Security note:** `-N ''` creates a key with no passphrase, which is
> required for fully automated deployment. The private key is stored encrypted
> at rest inside GitHub's Actions secrets (AES-256 at the repository level),
> so the main risk is if someone gains write access to your repository secrets.
> If you would prefer a passphrase-protected key, omit `-N ''`, set the
> passphrase, and also add a `VPS_KEY_PASSPHRASE` secret (see *Using a
> passphrase-protected key* in step 3 below).

Then print the private key so you can copy it:

```bash
ssh root@72.61.96.166 "cat ~/.ssh/id_ed25519"
```

#### 2. Authorise the key for SSH login on the VPS

The public key **must** be in the VPS's `authorized_keys` file — otherwise the
`appleboy/ssh-action` step will be refused when it tries to connect.

The command below is fully idempotent: it creates `~/.ssh/` (mode 700) and
`authorized_keys` (mode 600) if they don't exist, and only appends the key if
it isn't already listed:

```bash
ssh root@72.61.96.166 "
  mkdir -p ~/.ssh && chmod 700 ~/.ssh
  touch ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
  grep -qF \"\$(cat ~/.ssh/id_ed25519.pub)\" ~/.ssh/authorized_keys \
    || cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
"
```

Verify it was added:

```bash
ssh root@72.61.96.166 "cat ~/.ssh/authorized_keys"
```

You should see the key line starting with `ssh-ed25519 …` and ending with
`github-actions-deploy`.

#### 3. Add the private key to GitHub Secrets

Go to **Settings → Secrets and variables → Actions → New repository secret**.

| Secret name | Value |
|---|---|
| `VPS_SSH_KEY` | Full output of `cat ~/.ssh/id_ed25519` (private key retrieved or generated in step 1) |

> **Important:** Copy the *entire* file contents, including the header and
> footer, which must be **exactly**:
>
> ```
> -----BEGIN OPENSSH PRIVATE KEY-----
> ...base64 data...
> -----END OPENSSH PRIVATE KEY-----
> ```
>
> Five dashes on each side. A truncated or modified header causes the error
> *"Key is invalid. You must supply a key in OpenSSH public key format."*

#### Using a passphrase-protected key (optional)

If your private key is encrypted with a passphrase, add a second secret:

| Secret name | Value |
|---|---|
| `VPS_KEY_PASSPHRASE` | The passphrase for `VPS_SSH_KEY` |

Leave `VPS_KEY_PASSPHRASE` unset when using an unencrypted key.

#### Optional: private GHCR package

If the GHCR package visibility is **Private**, add:

| Secret name | Value |
|---|---|
| `GHCR_TOKEN` | GitHub PAT with `read:packages` scope |

### How the deploy works

```
git push → main
  └─ docker-push.yml   builds & pushes ghcr.io/teklemariama/motoko-the-civic-os-2:latest
  └─ vps-deploy.yml    SSHes into 72.61.96.166 as root and runs:
       docker pull  ghcr.io/teklemariama/motoko-the-civic-os-2:latest
       docker stop  civic-os  &&  docker rm civic-os
       docker run   -d -p 80:8000 --restart unless-stopped  civic-os
```



## Troubleshooting

**`cat: /root/.ssh/id_ed25519: No such file or directory`**

The VPS has no SSH key pair yet. Follow *Case B* in step 1 of *One-time VPS
setup* above to generate one:

```bash
ssh root@72.61.96.166 \
  "ssh-keygen -t ed25519 -C 'github-actions-deploy' -N '' -f ~/.ssh/id_ed25519"
```

Then add the public key to `authorized_keys` (step 2) and paste the private key
into the `VPS_SSH_KEY` secret (step 3).

**Unable to update or add new SSH key (`SHA256:… github-actions-deploy`)**

This means the key exists on the VPS but its public half is not (or cannot be
written) to `~/.ssh/authorized_keys`. Common causes:
- `~/.ssh/` directory does not exist yet.
- `~/.ssh/authorized_keys` does not exist yet (a bare `>>` redirect will fail
  if the parent directory is absent).
- `authorized_keys` or `~/.ssh/` has incorrect permissions (must be 600 and
  700 respectively).

Use the idempotent command from step 2 above, which handles all of these:

```bash
ssh root@72.61.96.166 "
  mkdir -p ~/.ssh && chmod 700 ~/.ssh
  touch ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
  grep -qF \"\$(cat ~/.ssh/id_ed25519.pub)\" ~/.ssh/authorized_keys \
    || cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
"
```

After running it, verify with:

```bash
ssh root@72.61.96.166 "cat ~/.ssh/authorized_keys"
```

**"Key is invalid. You must supply a key in OpenSSH public key format"**

This error from the VPS deploy workflow means the `VPS_SSH_KEY` secret is
malformed. Common causes:
- The `-----BEGIN`/`-----END` header or footer is missing dashes (must be 5
  on each side).
- The key was accidentally truncated when pasting.
- The key is passphrase-protected but `VPS_KEY_PASSPHRASE` is not set.

Fix: re-run `ssh root@72.61.96.166 "cat ~/.ssh/id_ed25519"` (or `id_rsa`),
copy the *complete* output into the `VPS_SSH_KEY` secret, and if the key is
encrypted, set the `VPS_KEY_PASSPHRASE` secret (see *VPS Deployment* above).

**General build failures**

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
