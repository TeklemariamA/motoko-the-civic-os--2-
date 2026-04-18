export const idlFactory = ({ IDL }) => {
  const Utxo = IDL.Record({
    'height' : IDL.Nat32,
    'value' : IDL.Nat64,
    'outpoint' : IDL.Record({ 'txid' : IDL.Vec(IDL.Nat8), 'vout' : IDL.Nat32 }),
  });
  const UtxoStatus = IDL.Variant({
    'ValueTooSmall' : Utxo,
    'Tainted' : Utxo,
    'Minted' : IDL.Record({
      'minted_amount' : IDL.Nat64,
      'block_index' : IDL.Nat64,
      'utxo' : Utxo,
    }),
    'Checked' : Utxo,
  });
  const PendingUtxo = IDL.Record({
    'confirmations' : IDL.Nat32,
    'value' : IDL.Nat64,
    'outpoint' : IDL.Record({ 'txid' : IDL.Vec(IDL.Nat8), 'vout' : IDL.Nat32 }),
  });
  const UpdateBalanceError = IDL.Variant({
    'GenericError' : IDL.Record({
      'error_message' : IDL.Text,
      'error_code' : IDL.Nat64,
    }),
    'TemporarilyUnavailable' : IDL.Text,
    'AlreadyProcessing' : IDL.Null,
    'NoNewUtxos' : IDL.Record({
      'required_confirmations' : IDL.Nat32,
      'pending_utxos' : IDL.Opt(IDL.Vec(PendingUtxo)),
      'current_confirmations' : IDL.Opt(IDL.Nat32),
    }),
  });
  const UpdateBalanceResult = IDL.Variant({
    'Ok' : IDL.Vec(UtxoStatus),
    'Err' : UpdateBalanceError,
  });
  const Bill = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Text,
    'title' : IDL.Text,
    'abstain_votes' : IDL.Nat,
    'yes_votes' : IDL.Nat,
    'body' : IDL.Text,
    'created_at' : IDL.Int,
    'author' : IDL.Text,
    'category' : IDL.Text,
    'no_votes' : IDL.Nat,
    'forked_from' : IDL.Opt(IDL.Nat),
  });
  const Member = IDL.Record({
    'bio' : IDL.Text,
    'merit' : IDL.Int,
    'name' : IDL.Text,
    'role' : IDL.Text,
    'joined_at' : IDL.Int,
    'is_active' : IDL.Bool,
  });
  const ResearchRecord = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'domain' : IDL.Text,
    'created_at' : IDL.Int,
    'author' : IDL.Text,
    'data_hash' : IDL.Text,
    'abstract_text' : IDL.Text,
  });
  const SkillCommit = IDL.Record({
    'id' : IDL.Nat,
    'member' : IDL.Text,
    'evidence_hash' : IDL.Text,
    'created_at' : IDL.Int,
    'endorsements' : IDL.Vec(IDL.Text),
    'skill' : IDL.Text,
  });
  const AuditEntry = IDL.Record({
    'verified' : IDL.Bool,
    'action' : IDL.Text,
    'proof_signature' : IDL.Text,
    'timestamp' : IDL.Int,
  });
  const RetrieveBtcError = IDL.Variant({
    'MalformedAddress' : IDL.Text,
    'GenericError' : IDL.Record({
      'error_message' : IDL.Text,
      'error_code' : IDL.Nat64,
    }),
    'TemporarilyUnavailable' : IDL.Text,
    'InsufficientAllowance' : IDL.Record({ 'allowance' : IDL.Nat64 }),
    'AlreadyProcessing' : IDL.Null,
    'AmountTooLow' : IDL.Nat64,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat64 }),
  });
  const RetrieveBtcResult = IDL.Variant({
    'Ok' : IDL.Record({ 'block_index' : IDL.Nat64 }),
    'Err' : RetrieveBtcError,
  });
  return IDL.Service({
    'castVerdict' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text],
        [IDL.Opt(IDL.Record({ 'verdict' : IDL.Text, 'message' : IDL.Text }))],
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
              'abstain' : IDL.Nat,
              'message' : IDL.Text,
            })
          ),
        ],
        [],
      ),
    'checkBtcDeposit' : IDL.Func([], [UpdateBalanceResult], []),
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
              'endorsement_count' : IDL.Nat,
              'skill_id' : IDL.Nat,
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
    'executeCivicFork' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Text, IDL.Text],
        [IDL.Text],
        [],
      ),
    'fileCase' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Record({ 'jury' : IDL.Vec(IDL.Text), 'case_id' : IDL.Nat })],
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
        [
          IDL.Opt(
            IDL.Record({ 'id' : IDL.Nat, 'current_reward' : IDL.Float64 })
          ),
        ],
        ['query'],
      ),
    'getBtcDepositAddress' : IDL.Func([], [IDL.Text], []),
    'getCkbtcBalance' : IDL.Func([], [IDL.Nat], []),
    'getMember' : IDL.Func([IDL.Text], [IDL.Opt(Member)], ['query']),
    'initiateAppeal' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'listBills' : IDL.Func([], [IDL.Vec(Bill)], ['query']),
    'listMembers' : IDL.Func([], [IDL.Vec(Member)], ['query']),
    'listResearch' : IDL.Func([], [IDL.Vec(ResearchRecord)], ['query']),
    'listSkillCommits' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(SkillCommit)],
        ['query'],
      ),
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
    'withdrawBtc' : IDL.Func([IDL.Text, IDL.Nat64], [RetrieveBtcResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
