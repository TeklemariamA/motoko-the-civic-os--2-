export const idlFactory = ({ IDL }) => {
  const ChatMessage = IDL.Variant({
    'user' : IDL.Record({ 'content' : IDL.Text }),
    'system' : IDL.Record({ 'content' : IDL.Text }),
  });
  const AuditEntry = IDL.Record({
    'timestamp' : IDL.Int,
    'proof_signature' : IDL.Text,
    'action' : IDL.Text,
    'verified' : IDL.Bool,
  });
  const Member = IDL.Record({
    'name' : IDL.Text,
    'bio' : IDL.Text,
    'role' : IDL.Text,
    'joined_at' : IDL.Int,
    'merit' : IDL.Int,
    'is_active' : IDL.Bool,
  });
  const SkillCommit = IDL.Record({
    'id' : IDL.Nat,
    'member' : IDL.Text,
    'skill' : IDL.Text,
    'evidence_hash' : IDL.Text,
    'endorsements' : IDL.Vec(IDL.Text),
    'created_at' : IDL.Int,
  });
  const ResearchRecord = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'author' : IDL.Text,
    'abstract_text' : IDL.Text,
    'data_hash' : IDL.Text,
    'domain' : IDL.Text,
    'created_at' : IDL.Int,
  });
  const Bill = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'body' : IDL.Text,
    'author' : IDL.Text,
    'category' : IDL.Text,
    'status' : IDL.Text,
    'yes_votes' : IDL.Nat,
    'no_votes' : IDL.Nat,
    'abstain_votes' : IDL.Nat,
    'created_at' : IDL.Int,
    'forked_from' : IDL.Opt(IDL.Nat),
  });
  return IDL.Service({
    'chat' : IDL.Func(
        [IDL.Vec(ChatMessage)],
        [IDL.Text],
        [],
      ),
    'castVote' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text],
        [
          IDL.Opt(
            IDL.Record({
              'no' : IDL.Nat,
              'yes' : IDL.Nat,
              'status' : IDL.Text,
              'message' : IDL.Text,
              'abstain' : IDL.Nat,
            })
          ),
        ],
        [],
      ),
    'castVerdict' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text],
        [IDL.Opt(IDL.Record({ 'verdict' : IDL.Text, 'message' : IDL.Text }))],
        [],
      ),
    'commitSkill' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [IDL.Opt(IDL.Record({ 'skill_id' : IDL.Nat, 'message' : IDL.Text }))],
        [],
      ),
    'createBounty' : IDL.Func(
        [IDL.Text, IDL.Float64, IDL.Float64],
        [IDL.Record({ 'message' : IDL.Text, 'bounty_id' : IDL.Nat })],
        [],
      ),
    'endorseSkill' : IDL.Func(
        [IDL.Nat, IDL.Text],
        [
          IDL.Opt(
            IDL.Record({
              'skill_id' : IDL.Nat,
              'endorsement_count' : IDL.Nat,
              'message' : IDL.Text,
            })
          ),
        ],
        [],
      ),
    'enrollMember' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [IDL.Record({ 'ok' : IDL.Bool, 'message' : IDL.Text })],
        [],
      ),
    'fileCase' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Record({ 'case_id' : IDL.Nat, 'jury' : IDL.Vec(IDL.Text) })],
        [],
      ),
    'forkBill' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Opt(IDL.Record({ 'bill_id' : IDL.Nat, 'message' : IDL.Text }))],
        [],
      ),
    'getBill' : IDL.Func([IDL.Nat], [IDL.Opt(Bill)], ['query']),
    'getBountyValue' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(IDL.Record({ 'id' : IDL.Nat, 'current_reward' : IDL.Float64 }))],
        ['query'],
      ),
    'getMember' : IDL.Func([IDL.Text], [IDL.Opt(Member)], ['query']),
    'listBills' : IDL.Func([], [IDL.Vec(Bill)], ['query']),
    'listMembers' : IDL.Func([], [IDL.Vec(Member)], ['query']),
    'listResearch' : IDL.Func([], [IDL.Vec(ResearchRecord)], ['query']),
    'listSkillCommits' : IDL.Func([IDL.Text], [IDL.Vec(SkillCommit)], ['query']),
    'privateAction' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Record({ 'message' : IDL.Text })],
        [],
      ),
    'proposeBill' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Record({ 'bill_id' : IDL.Nat, 'message' : IDL.Text })],
        [],
      ),
    'publicLog' : IDL.Func([], [IDL.Vec(AuditEntry)], ['query']),
    'publishResearch' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Record({ 'research_id' : IDL.Nat, 'message' : IDL.Text })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
