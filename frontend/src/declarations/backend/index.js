import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './service.did.js';

const runtimeConfig = globalThis?.CIVIC_OS_CONFIG || {};
const processEnv = typeof process !== 'undefined' ? process.env : {};
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const stripQuotes = (value) => {
  if (!value || typeof value !== 'string') return value;
  return value.replace(/^['\"]|['\"]$/g, '');
};

const readRuntimeValue = (key) => {
  if (!hasOwn(runtimeConfig, key)) return undefined;
  const value = stripQuotes(runtimeConfig[key]);
  // Treat empty strings as unset so build-time env fallbacks can still apply.
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
};

const canisterId = stripQuotes(
  readRuntimeValue('CANISTER_ID_BACKEND')
    ? readRuntimeValue('CANISTER_ID_BACKEND')
    : (
      readRuntimeValue('CANISTER_ID')
        ? readRuntimeValue('CANISTER_ID')
        : (
          processEnv.CANISTER_ID_BACKEND
          || processEnv.CANISTER_ID
          || import.meta.env.CANISTER_ID_BACKEND
          || import.meta.env.CANISTER_ID
          || ''
        )
    )
);

const isLocal = typeof window !== 'undefined' ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' : false;

const dfxNetwork = stripQuotes(
  readRuntimeValue('DFX_NETWORK')
    ? readRuntimeValue('DFX_NETWORK')
    : (processEnv.DFX_NETWORK || import.meta.env?.DFX_NETWORK || (isLocal ? 'local' : 'ic'))
);

const defaultHost = stripQuotes(
  readRuntimeValue('IC_HOST') || (dfxNetwork === 'ic' ? 'https://icp-api.io' : 'http://localhost:4943')
);

const unavailable = (methodName) => async () => {
  throw new Error(
    `Backend actor unavailable for ${methodName}. Configure CANISTER_ID_BACKEND and optionally IC_HOST/DFX_NETWORK at build/runtime.`
  );
};

const createBackendActor = () => {
  if (!canisterId) {
    return {
      createBounty: unavailable('createBounty'),
      getBountyValue: unavailable('getBountyValue'),
      privateAction: unavailable('privateAction'),
      publicLog: unavailable('publicLog'),
      fileCase: unavailable('fileCase'),
      castVerdict: unavailable('castVerdict'),
      enrollMember: unavailable('enrollMember'),
      getMember: unavailable('getMember'),
      listMembers: unavailable('listMembers'),
      commitSkill: unavailable('commitSkill'),
      endorseSkill: unavailable('endorseSkill'),
      listSkillCommits: unavailable('listSkillCommits'),
      publishResearch: unavailable('publishResearch'),
      listResearch: unavailable('listResearch'),
      proposeBill: unavailable('proposeBill'),
      castVote: unavailable('castVote'),
      listBills: unavailable('listBills'),
      forkBill: unavailable('forkBill'),
      getBtcDepositAddress: unavailable('getBtcDepositAddress'),
      checkBtcDeposit: unavailable('checkBtcDeposit'),
      getCkbtcBalance: unavailable('getCkbtcBalance'),
      withdrawBtc: unavailable('withdrawBtc')
    };
  }

  const agent = new HttpAgent({ host: defaultHost });
  if (dfxNetwork !== 'ic') {
    agent.fetchRootKey().catch((err) => {
      console.warn('Unable to fetch root key from local replica.', err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId
  });
};

console.log("Resolved canisterId:", canisterId, "process.env:", processEnv);
export const backend = createBackendActor();
