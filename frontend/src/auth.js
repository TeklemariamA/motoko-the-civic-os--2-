import { AuthClient } from "@icp-sdk/auth/client";
import { HttpAgent, Actor } from "@icp-sdk/core/agent";
import { safeGetCanisterEnv } from "@icp-sdk/core/agent/canister-env";
import { idlFactory } from "./declarations/backend/service.did.js";

// Read the ic_env cookie
const canisterEnv = safeGetCanisterEnv();

const runtimeConfig = globalThis?.CIVIC_OS_CONFIG || {};
const processEnv = typeof process !== 'undefined' ? process.env : {};
const stripQuotes = (val) => (!val || typeof val !== 'string' ? val : val.replace(/^['"]|['"]$/g, ''));
const readRuntimeValue = (key) => stripQuotes(runtimeConfig[key]);

const canisterId = stripQuotes(
  readRuntimeValue('CANISTER_ID_BACKEND') || readRuntimeValue('CANISTER_ID') ||
  process.env.CANISTER_ID_BACKEND || process.env.CANISTER_ID ||
  import.meta.env?.CANISTER_ID_BACKEND || import.meta.env?.VITE_CANISTER_ID_BACKEND || import.meta.env?.CANISTER_ID || 
  "ymwcy-eqaaa-aaaag-aywca-cai"
);

export function getIdentityProviderUrl() {
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost");
  if (isLocal) {
    return "http://id.ai.localhost:8000"; // Frontend canister ID alias for local II
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
    authClient.login({
      identityProvider: getIdentityProviderUrl(),
      maxTimeToLive: BigInt(8) * BigInt(3_600_000_000_000), // 8 hours in nanoseconds
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

const isLocal = typeof window !== 'undefined' ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.localhost') : false;

const dfxNetwork = stripQuotes(
  readRuntimeValue('DFX_NETWORK') || process.env.DFX_NETWORK || import.meta.env?.DFX_NETWORK || (isLocal ? 'local' : 'ic')
);

const defaultHost = stripQuotes(
  readRuntimeValue('IC_HOST') || (dfxNetwork === 'ic' ? 'https://icp-api.io' : 'http://127.0.0.1:4943')
);

export async function createAuthenticatedActor(identity) {
  const agent = await HttpAgent.create({
    identity,
    host: defaultHost,
    rootKey: canisterEnv?.IC_ROOT_KEY,
  });

  return Actor.createActor(idlFactory, { agent, canisterId });
}
