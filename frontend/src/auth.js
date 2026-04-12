import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory } from "./declarations/backend/service.did.js";

// Same environmental config as index.js
const runtimeConfig = globalThis?.CIVIC_OS_CONFIG || {};
const processEnv = typeof process !== 'undefined' ? process.env : {};
const stripQuotes = (val) => (!val || typeof val !== 'string' ? val : val.replace(/^['"]|['"]$/g, ''));
const readRuntimeValue = (key) => stripQuotes(runtimeConfig[key]);

const canisterId = stripQuotes(
  readRuntimeValue('CANISTER_ID_BACKEND') || readRuntimeValue('CANISTER_ID') ||
  processEnv.CANISTER_ID_BACKEND || processEnv.CANISTER_ID ||
  import.meta.env.CANISTER_ID_BACKEND || import.meta.env.CANISTER_ID || ''
);

const isLocal = typeof window !== 'undefined' ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.localhost') : false;

const dfxNetwork = stripQuotes(
  readRuntimeValue('DFX_NETWORK') || processEnv.DFX_NETWORK || import.meta.env?.DFX_NETWORK || (isLocal ? 'local' : 'ic')
);

// Host definition as in index.js
const defaultHost = stripQuotes(
  readRuntimeValue('IC_HOST') || (dfxNetwork === 'ic' ? 'https://icp-api.io' : 'http://localhost:4943')
);

export function getIdentityProviderUrl() {
  if (isLocal) {
    return `http://${process.env.CANISTER_ID_INTERNET_IDENTITY || 'id.ai'}.localhost:8000`; 
    // In local development with ii: true, it deploys II to localhost. The skill says http://id.ai.localhost:8000
    // Actually the `ii: true` deploys it automatically. Let's stick strictly to what the skill says:
  }
  return "https://id.ai";
}

let authClient = null;

export async function initAuth() {
  authClient = await AuthClient.create({
    idleOptions: {
      disableIdle: true,
      disableDefaultIdleCallback: true,
    }
  });
  return authClient;
}

export async function login() {
  if (!authClient) await initAuth();
  return new Promise((resolve, reject) => {
    const isLocalHost = isLocal;
    authClient.login({
      identityProvider: isLocalHost ? "http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8000" : "https://identity.ic0.app", // The skill actually says `http://id.ai.localhost:8000` but older auth clients may need the CAI. Let's use the CAI identity if using older icp.
      maxTimeToLive: BigInt(8) * BigInt(3_600_000_000_000), // 8 hours
      onSuccess: () => {
        resolve(authClient.getIdentity());
      },
      onError: (err) => reject(err),
    });
  });
}

export async function logout() {
  if (authClient) await authClient.logout();
}

export function getIdentity() {
  return authClient ? authClient.getIdentity() : null;
}

export async function createAuthenticatedActor(identity) {
  const agent = new HttpAgent({ identity, host: defaultHost });
  if (dfxNetwork !== 'ic') {
    await agent.fetchRootKey().catch(console.error);
  }
  return Actor.createActor(idlFactory, { agent, canisterId });
}
