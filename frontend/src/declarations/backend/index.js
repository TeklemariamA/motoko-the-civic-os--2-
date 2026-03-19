import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './service.did.js';

const runtimeConfig = globalThis?.CIVIC_OS_CONFIG || {};
const processEnv = typeof process !== 'undefined' ? process.env : {};
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const stripQuotes = (value) => {
  if (!value || typeof value !== 'string') return value;
  return value.replace(/^['\"]|['\"]$/g, '');
};

const canisterId = stripQuotes(
  hasOwn(runtimeConfig, 'CANISTER_ID_BACKEND')
    ? runtimeConfig.CANISTER_ID_BACKEND
    : (
      hasOwn(runtimeConfig, 'CANISTER_ID')
        ? runtimeConfig.CANISTER_ID
        : (
          processEnv.CANISTER_ID_BACKEND
          || processEnv.CANISTER_ID
          || import.meta.env.CANISTER_ID_BACKEND
          || import.meta.env.CANISTER_ID
          || ''
        )
    )
);

const dfxNetwork = stripQuotes(
  hasOwn(runtimeConfig, 'DFX_NETWORK')
    ? runtimeConfig.DFX_NETWORK
    : (processEnv.DFX_NETWORK || import.meta.env.DFX_NETWORK || 'ic')
);

const defaultHost = stripQuotes(
  runtimeConfig.IC_HOST || (dfxNetwork === 'ic' ? 'https://icp-api.io' : 'http://127.0.0.1:4943')
);

const unavailable = (methodName) => async () => {
  throw new Error(
    `Backend actor unavailable for ${methodName}. Configure CANISTER_ID_BACKEND and optionally IC_HOST/DFX_NETWORK at build/runtime.`
  );
};

const createBackendActor = () => {
  if (!canisterId) {
    return {
      chat: unavailable('chat'),
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
      forkBill: unavailable('forkBill')
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

export const backend = createBackendActor();