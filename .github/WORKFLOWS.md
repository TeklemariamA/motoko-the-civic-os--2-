# GitHub Actions Workflows

This repository includes several GitHub Actions workflows for continuous integration, deployment, and automation.

## Workflows

### 1. IC Deploy (`ic-deploy.yml`) ✨ NEW

**Purpose:** Build and deploy the Motoko-based LLM Chatbot dapp to the Internet Computer mainnet.

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**What it does:**
1. Sets up Node.js environment
2. Installs dfx (Internet Computer SDK)
3. Installs mops (Motoko package manager)
4. Installs project and Motoko dependencies
5. Builds the frontend (React/Vite)
6. Generates Candid interfaces
7. Deploys to IC mainnet (when DFX_IDENTITY secret is configured)

**Setup for Deployment:**

To enable actual deployment to IC mainnet, you need to configure a dfx identity:

```bash
# Create a new identity
dfx identity new github-actions

# Use the identity
dfx identity use github-actions

# Export the identity
dfx identity export github-actions > identity.pem
```

Then add the content of `identity.pem` as a GitHub secret named `DFX_IDENTITY`:
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `DFX_IDENTITY`
4. Value: Paste the entire content of `identity.pem`

**Important:** Ensure your identity has sufficient cycles for deployment. You can check with:
```bash
dfx wallet balance
```

### 2. Node.js CI (`node.js.yml`) 🔄 UPDATED

**Purpose:** Continuous integration testing across multiple Node.js versions.

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**What it does:**
1. Tests the project on Node.js versions 18.x, 20.x, and 22.x
2. Installs dfx and mops
3. Installs all dependencies (npm and Motoko)
4. Builds the project
5. Runs tests (if available)

### 3. Deploy Frontend to Pages (`pages-deploy.yml`) 🔄 UPDATED

**Purpose:** Deploy the frontend static assets to GitHub Pages.

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**What it does:**
1. Builds the frontend with all necessary dependencies
2. Uploads the build artifacts to GitHub Pages
3. Deploys to GitHub Pages

**Setup:**
Enable GitHub Pages in repository Settings → Pages → Source: GitHub Actions

### 4. Docker Build & Push (`docker-push.yml`) ✨ NEW

**Purpose:** Build and push Docker images of the CivicOS v2.0 backend to civic-os-opensourcism.cloud registry.

**Triggers:**
- Push to `main` branch (when backend/, Dockerfile, or workflow changes)
- Manual workflow dispatch

**What it does:**
1. Builds Docker image for the FastAPI backend
2. Tags image with multiple tags (latest, branch name, git SHA, semantic version)
3. Pushes image to civic-os-opensourcism.cloud registry
4. Uses build cache for faster builds

**Setup:**
Add the following secrets:
- `DOCKER_USERNAME`: Username for civic-os-opensourcism.cloud registry
- `DOCKER_PASSWORD`: Password/token for civic-os-opensourcism.cloud registry

The image will be available at:
```
civic-os-opensourcism.cloud/motoko-civic-os:latest
```

For more details, see [DOCKER.md](../DOCKER.md).

### 5. Datadog Synthetic Tests (`datadog-synthetics.yml`)

**Purpose:** Run Datadog synthetic monitoring tests.

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Setup:**
Add the following secrets:
- `DD_API_KEY`: Datadog API key
- `DD_APP_KEY`: Datadog Application key

### 6. NPM Publish (`npm-publish.yml`)

**Purpose:** Publish packages to npm registry (if applicable).

### 7. SLSA Provenance (`generator-generic-ossf-slsa3-publish.yml`)

**Purpose:** Generate SLSA3 provenance for supply chain security.

## Best Practices

1. **Security:**
   - Never commit private keys or identities to the repository
   - Use GitHub secrets for sensitive data
   - Rotate identities periodically

2. **Cycles Management:**
   - Monitor cycle balance regularly
   - Set up automatic top-up using CycleOps or similar services
   - Ensure sufficient cycles before deployment

3. **Testing:**
   - Always test locally before pushing to main
   - Use pull requests to trigger CI tests
   - Review workflow logs for any issues

## Local Development

For local development, see [BUILD.md](BUILD.md) for detailed instructions.

## Troubleshooting

### Deployment fails with "insufficient cycles"
- Check your wallet balance: `dfx wallet balance`
- Top up cycles: `dfx cycles convert --amount <ICP_AMOUNT>`

### Authentication errors
- Verify DFX_IDENTITY secret is properly set
- Ensure the identity has the correct permissions
- Check that the identity.pem format is correct

### Build failures
- Clear local cache: `rm -rf .dfx node_modules frontend/node_modules`
- Reinstall dependencies: `npm ci`
- Check dfx and mops versions match requirements

## Resources

- [Internet Computer Documentation](https://internetcomputer.org/docs)
- [dfx CLI Reference](https://internetcomputer.org/docs/building-apps/developer-tools/dfx/dfx-reference)
- [Motoko Documentation](https://internetcomputer.org/docs/motoko/main/about-this-guide)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
