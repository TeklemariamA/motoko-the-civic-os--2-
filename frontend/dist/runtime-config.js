// Runtime config loaded before app bootstrap.
// Set these values in production without rebuilding the frontend bundle.
// In Docker deployments, this file is generated at container startup from env vars.
window.CIVIC_OS_CONFIG = {
  // Example: "abcde-fghij-klmno-pqrst-uvwxy-z"
  CANISTER_ID_BACKEND: "uxrrr-q7777-77774-qaaaq-cai",
  // Use "ic" for mainnet, "local" for local replica.
  DFX_NETWORK: "local",
  // Optional override for HTTP agent host.
  IC_HOST: "http://127.0.0.1:4943",
  // External chat endpoint (Nexo).
  CHAT_ENDPOINT: "https://civic-os-opensourcism.cloud/chat",
  // Toggle AI chatbot UI and backend.chat calls.
  ENABLE_CHATBOT: "false"
};
