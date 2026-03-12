export const backend = {
  chat: async () => "Backend unavailable in this deployment",
  createBounty: async () => ({ message: "Unavailable", bounty_id: 0 }),
  getBountyValue: async () => null,
  privateAction: async () => ({ message: "Unavailable" }),
  publicLog: async () => [],
  fileCase: async () => ({ case_id: 0, jury: [] }),
  castVerdict: async () => ({ message: "Unavailable" }),
  endorseSkill: async () => null,
  listSkillCommits: async () => [],
  publishResearch: async () => ({ research_id: 0, message: "Unavailable" }),
  listResearch: async () => []
};
