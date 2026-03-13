export const backend = {
  chat: async (...args) => {
    throw new Error('Backend actor not configured in this deployment. Connect the generated canister declarations or deploy the backend canister.');
  },
  createBounty: async (...args) => {
    throw new Error('Backend actor not configured in this deployment. Connect the generated canister declarations or deploy the backend canister.');
  },
  getBountyValue: async (...args) => [],
  privateAction: async (...args) => {
    throw new Error('Backend actor not configured in this deployment. Connect the generated canister declarations or deploy the backend canister.');
  },
  publicLog: async (...args) => [],
  fileCase: async (...args) => {
    throw new Error('Backend actor not configured in this deployment. Connect the generated canister declarations or deploy the backend canister.');
  },
  castVerdict: async (...args) => [],
  enrollMember: async (...args) => {
    throw new Error('Backend actor not configured in this deployment. Connect the generated canister declarations or deploy the backend canister.');
  },
  getMember: async (...args) => [],
  listMembers: async (...args) => [],
  commitSkill: async (...args) => [],
  endorseSkill: async (...args) => [],
  listSkillCommits: async (...args) => [],
  publishResearch: async (...args) => {
    throw new Error('Backend actor not configured in this deployment. Connect the generated canister declarations or deploy the backend canister.');
  },
  listResearch: async (...args) => [],
  proposeBill: async (...args) => {
    throw new Error('Backend actor not configured in this deployment. Connect the generated canister declarations or deploy the backend canister.');
  },
  castVote: async (...args) => [],
  listBills: async (...args) => [],
  forkBill: async (...args) => []
};