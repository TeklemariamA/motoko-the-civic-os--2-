import { Actor, HttpAgent } from "@dfinity/agent";

export const idlFactory = ({ IDL }) => {
  const ChatMessage = IDL.Variant({
    user: IDL.Record({ content: IDL.Text }),
    system: IDL.Record({ content: IDL.Text }),
  });
  const AuditEntry = IDL.Record({
    timestamp: IDL.Int,
    proof_signature: IDL.Text,
    action: IDL.Text,
    verified: IDL.Bool,
  });
  const Bill = IDL.Record({
    id: IDL.Nat,
    title: IDL.Text,
    body: IDL.Text,
    author: IDL.Text,
    category: IDL.Text,
    status: IDL.Text,
    yes_votes: IDL.Nat,
    no_votes: IDL.Nat,
    abstain_votes: IDL.Nat,
    created_at: IDL.Int,
    forked_from: IDL.Opt(IDL.Nat),
  });
  const Member = IDL.Record({
    name: IDL.Text,
    bio: IDL.Text,
    role: IDL.Text,
    joined_at: IDL.Int,
    merit: IDL.Int,
    is_active: IDL.Bool,
  });
  const SkillCommit = IDL.Record({
    id: IDL.Nat,
    member: IDL.Text,
    skill: IDL.Text,
    evidence_hash: IDL.Text,
    endorsements: IDL.Vec(IDL.Text),
    created_at: IDL.Int,
  });
  const ResearchRecord = IDL.Record({
    id: IDL.Nat,
    title: IDL.Text,
    author: IDL.Text,
    abstract_text: IDL.Text,
    data_hash: IDL.Text,
    domain: IDL.Text,
    created_at: IDL.Int,
  });
  return IDL.Service({
    chat: IDL.Func([IDL.Vec(ChatMessage)], [IDL.Text], []),
    createBounty: IDL.Func(
      [IDL.Text, IDL.Float64, IDL.Float64],
      [IDL.Record({ message: IDL.Text, bounty_id: IDL.Nat })],
      [],
    ),
    getBountyValue: IDL.Func(
      [IDL.Nat],
      [IDL.Opt(IDL.Record({ id: IDL.Nat, current_reward: IDL.Float64 }))],
      ["query"],
    ),
    privateAction: IDL.Func(
      [IDL.Text, IDL.Text],
      [IDL.Record({ message: IDL.Text })],
      [],
    ),
    publicLog: IDL.Func([], [IDL.Vec(AuditEntry)], ["query"]),
    fileCase: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
      [IDL.Record({ case_id: IDL.Nat, jury: IDL.Vec(IDL.Text) })],
      [],
    ),
    castVerdict: IDL.Func(
      [IDL.Nat, IDL.Text, IDL.Text],
      [IDL.Opt(IDL.Record({ verdict: IDL.Text, message: IDL.Text }))],
      [],
    ),
    proposeBill: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
      [IDL.Record({ bill_id: IDL.Nat, message: IDL.Text })],
      [],
    ),
    castVote: IDL.Func(
      [IDL.Nat, IDL.Text, IDL.Text],
      [
        IDL.Opt(
          IDL.Record({
            yes: IDL.Nat,
            no: IDL.Nat,
            abstain: IDL.Nat,
            status: IDL.Text,
            message: IDL.Text,
          }),
        ),
      ],
      [],
    ),
    getBill: IDL.Func([IDL.Nat], [IDL.Opt(Bill)], ["query"]),
    listBills: IDL.Func([], [IDL.Vec(Bill)], ["query"]),
    forkBill: IDL.Func(
      [IDL.Nat, IDL.Text, IDL.Text, IDL.Text],
      [IDL.Opt(IDL.Record({ bill_id: IDL.Nat, message: IDL.Text }))],
      [],
    ),
    enrollMember: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text],
      [IDL.Record({ ok: IDL.Bool, message: IDL.Text })],
      [],
    ),
    getMember: IDL.Func([IDL.Text], [IDL.Opt(Member)], ["query"]),
    listMembers: IDL.Func([], [IDL.Vec(Member)], ["query"]),
    commitSkill: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text],
      [IDL.Opt(IDL.Record({ skill_id: IDL.Nat, message: IDL.Text }))],
      [],
    ),
    endorseSkill: IDL.Func(
      [IDL.Nat, IDL.Text],
      [
        IDL.Opt(
          IDL.Record({
            skill_id: IDL.Nat,
            endorsement_count: IDL.Nat,
            message: IDL.Text,
          }),
        ),
      ],
      [],
    ),
    listSkillCommits: IDL.Func([IDL.Text], [IDL.Vec(SkillCommit)], ["query"]),
    publishResearch: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
      [IDL.Record({ research_id: IDL.Nat, message: IDL.Text })],
      [],
    ),
    listResearch: IDL.Func([], [IDL.Vec(ResearchRecord)], ["query"]),
  });
};

// Fall back to the well-known local replica canister ID when env var is not set.
export const canisterId =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.CANISTER_ID_BACKEND) ||
  "uxrrr-q7777-77774-qaaaq-cai";

export function createActor(canisterId, options = {}) {
  const isLocal =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    (import.meta.env.DEV || import.meta.env.DFX_NETWORK === "local");

  const host = isLocal ? "http://127.0.0.1:4943" : "https://icp-api.io";

  const agent = options.agent || new HttpAgent({
    host,
    ...options.agentOptions,
  });

  // fetchRootKey is only needed for local replicas; never call it in production.
  if (isLocal) {
    agent.fetchRootKey().catch((err) => {
      console.warn("Unable to fetch root key. Check that your local replica is running.");
      console.error(err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
}

export const backend = createActor(canisterId);