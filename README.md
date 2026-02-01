# LLM Chatbot

The LLM Chatbot example demonstrates how an ICP smart contract can be used to interact with a large language model (LLM) to generate text. The user can input a prompt, and the smart contract will use the LLM to generate a response.
The response is then returned to the user, and the user can submit some follow-up prompts to continue the conversation.

## Deploying from ICP Ninja

When viewing this project in ICP Ninja, you can deploy it directly to the mainnet for free by clicking "Run" in the upper right corner. Open this project in ICP Ninja:

[![](https://icp.ninja/assets/open.svg)](https://icp.ninja/i?g=https://github.com/dfinity/examples/motoko/llm_chatbot)

## Build and deploy from the command-line

### 1. [Download and install the IC SDK.](https://internetcomputer.org/docs/building-apps/getting-started/install)

### 2. Setting up Ollama

To be able to test the agent locally, you'll need a server for processing the agent's prompts. For that, we'll use `ollama`, which is a tool that can download and serve LLMs.
See the documentation on the [Ollama website](https://ollama.com/) to install it. Once it's installed, run:

```
ollama serve
# Expected to start listening on port 11434
```

The above command will start the Ollama server, so that it can process requests by the agent. Additionally, and in a separate window, run the following command to download the LLM that will be used by the agent:

```
ollama run llama3.1:8b
```

The above command will download an 8B parameter model, which is around 4GiB. Once the command executes and the model is loaded, you can terminate it. You won't need to do this step again.

### 3. Download your project from ICP Ninja using the 'Download files' button on the upper left corner, or [clone the GitHub examples repository.](https://github.com/dfinity/examples/)

### 4. Navigate into the project's directory.

### 5. Deploy the project to your local environment:

```
dfx start --background --clean && dfx deploy
```

## CI/CD and Deployment

This repository includes automated GitHub Actions workflows for continuous integration and deployment:

### Automated Workflows

- **Node.js CI**: Tests the project across Node.js versions 18.x, 20.x, and 22.x on every push and pull request
- **IC Deploy**: Automatically builds and deploys to Internet Computer mainnet on pushes to main (requires setup)
- **GitHub Pages**: Deploys the frontend to GitHub Pages for easy preview

For detailed information about workflows and deployment setup, see [.github/WORKFLOWS.md](.github/WORKFLOWS.md).

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
