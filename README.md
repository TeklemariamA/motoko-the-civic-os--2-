# CivicOS Chat

The CivicOS frontend now calls the external Nexo chat service at https://civic-os-opensourcism.cloud/chat (no auth) for conversational replies. The ICP backend no longer depends on an on-chain LLM; CivicOS modules (bounties, justice, membership, research, governance) continue to run on-chain.

## Build and deploy from the command-line

1. [Install the IC SDK.](https://internetcomputer.org/docs/building-apps/getting-started/install)
2. Clone the repository and navigate into it.
3. Deploy locally:

```bash
dfx start --background --clean && dfx deploy
```

## CI/CD and Deployment

This repository includes automated GitHub Actions workflows for continuous integration and deployment:

### Automated Workflows

- **Node.js CI**: Tests the project across Node.js versions 18.x, 20.x, and 22.x on every push and pull request
- **IC Deploy**: Automatically builds and deploys to Internet Computer mainnet on pushes to main (requires setup)
- **GitHub Pages**: Deploys the frontend to GitHub Pages for easy preview
- **Docker Build & Push**: Builds and pushes Docker images to civic-os-opensourcism.cloud registry
- **YML Upload**: Automatically uploads workflow files to hosting service at srv1163-files.hstgr.io

For detailed information about workflows and deployment setup, see [.github/WORKFLOWS.md](.github/WORKFLOWS.md).

## Docker Deployment

The CivicOS v2.0 backend can be deployed as a Docker container. See [DOCKER.md](DOCKER.md) for complete instructions.

### Quick Start with Docker

Build and run locally:
```bash
docker build -t civic-os:latest .
docker run -d -p 8000:8000 civic-os:latest
```

Access the API at http://localhost:8000/docs

For automated deployment to civic-os-opensourcism.cloud, configure the `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets in your repository settings.

### Setting up Mainnet Deployment

To enable automatic deployment to IC mainnet:

1. Create a dfx identity for GitHub Actions:
   ```bash
   dfx identity new github-actions
   dfx identity use github-actions
   dfx identity export github-actions > identity.pem
   ```

2. Add the identity as a GitHub secret:
   - Go to repository Settings → Secrets and variables → Actions
   - Create a new secret named `DFX_IDENTITY`
   - Paste the content of `identity.pem` as the value

3. Ensure the identity has sufficient cycles for deployment

For more details, see the [workflow documentation](.github/WORKFLOWS.md).

## Security considerations and best practices

If you base your application on this example, it is recommended that you familiarize yourself with and adhere to the [security best practices](https://internetcomputer.org/docs/building-apps/security/overview) for developing on ICP. This example may not implement all the best practices.
