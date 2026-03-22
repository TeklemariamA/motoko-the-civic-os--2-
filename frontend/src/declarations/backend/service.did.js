export const idlFactory = ({ IDL }) => {
  const Bill = IDL.Record({
    'id': IDL.Nat,
    'status': IDL.Text,
    'title': IDL.Text,
    'abstain_votes': IDL.Nat,
    'yes_votes': IDL.Nat,
    'body': IDL.Text,
    'created_at': IDL.Int,
    'author': IDL.Text,
    'category': IDL.Text,
    'no_votes': IDL.Nat,
    'forked_from': IDL.Opt(IDL.Nat),
  });
  const Member = IDL.Record({
    'bio': IDL.Text,
    'merit': IDL.Int,
    'name': IDL.Text,
    'role': IDL.Text,
    'joined_at': IDL.Int,
    'is_active': IDL.Bool,
  });
  const ResearchRecord = IDL.Record({
    'id': IDL.Nat,
    'title': IDL.Text,
    'domain': IDL.Text,
    'created_at': IDL.Int,
    'author': IDL.Text,
    'data_hash': IDL.Text,
    'abstract_text': IDL.Text,
  });
  const SkillCommit = IDL.Record({
    'id': IDL.Nat,
    'member': IDL.Text,
    'evidence_hash': IDL.Text,
    'created_at': IDL.Int,
    'endorsements': IDL.Vec(IDL.Text),
    'skill': IDL.Text,
  });
  const AuditEntry = IDL.Record({
    'verified': IDL.Bool,
    'action': IDL.Text,
    'proof_signature': IDL.Text,
    'timestamp': IDL.Int,
  });
  return IDL.Service({
    'castVerdict': IDL.Func(
      [IDL.Nat, IDL.Text, IDL.Text],
      [IDL.Opt(IDL.Record({ 'verdict': IDL.Text, 'message': IDL.Text }))],
      [],
    ),
    'castVote': IDL.Func(
      [IDL.Nat, IDL.Text, IDL.Text],
      [
        IDL.Opt(
          IDL.Record({
            'no': IDL.Nat,
            'yes': IDL.Nat,
            'status': IDL.Text,
            'abstain': IDL.Nat,
            'message': IDL.Text,
          }),
        ),
      ],
      [],
    ),
    'commitSkill': IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text],
      [IDL.Opt(IDL.Record({ 'skill_id': IDL.Nat, 'message': IDL.Text }))],
      [],
    ),
    'createBounty': IDL.Func(
      [IDL.Text, IDL.Float64, IDL.Float64],
      [IDL.Record({ 'message': IDL.Text, 'bounty_id': IDL.Nat })],
      [],
    ),
    'endorseSkill': IDL.Func(
      [IDL.Nat, IDL.Text],
      [
        IDL.Opt(
          IDL.Record({
            'endorsement_count': IDL.Nat,
            'skill_id': IDL.Nat,
            'message': IDL.Text,
          }),
        ),
      ],
      [],
    ),
    'enrollMember': IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text],
      [IDL.Record({ 'ok': IDL.Bool, 'message': IDL.Text })],
      [],
    ),
    'fileCase': IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
      [IDL.Record({ 'jury': IDL.Vec(IDL.Text), 'case_id': IDL.Nat })],
      [],
    ),
    'forkBill': IDL.Func(
      [IDL.Nat, IDL.Text, IDL.Text, IDL.Text],
      [IDL.Opt(IDL.Record({ 'bill_id': IDL.Nat, 'message': IDL.Text }))],
      [],
    ),
    'getBill': IDL.Func([IDL.Nat], [IDL.Opt(Bill)], ['query']),
    'getBountyValue': IDL.Func(
      [IDL.Nat],
      [IDL.Opt(IDL.Record({ 'id': IDL.Nat, 'current_reward': IDL.Float64 }))],
      ['query'],
    ),
    'getMember': IDL.Func([IDL.Text], [IDL.Opt(Member)], ['query']),
    'listBills': IDL.Func([], [IDL.Vec(Bill)], ['query']),
    'listMembers': IDL.Func([], [IDL.Vec(Member)], ['query']),
    'listResearch': IDL.Func([], [IDL.Vec(ResearchRecord)], ['query']),
    'listSkillCommits': IDL.Func([IDL.Text], [IDL.Vec(SkillCommit)], ['query']),
    'privateAction': IDL.Func(
      [IDL.Text, IDL.Text],
      [IDL.Record({ 'message': IDL.Text })],
      [],
    ),
    'proposeBill': IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
      [IDL.Record({ 'bill_id': IDL.Nat, 'message': IDL.Text })],
      [],
    ),
    'publicLog': IDL.Func([], [IDL.Vec(AuditEntry)], ['query']),
    'publishResearch': IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
      [IDL.Record({ 'research_id': IDL.Nat, 'message': IDL.Text })],
      [],
    ),
  });
};

export const init = ({ IDL }) => {
  return [];
};
