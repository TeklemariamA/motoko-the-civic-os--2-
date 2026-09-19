export const idlFactory = ({ IDL }) => {
  const DisputeTier = IDL.Variant({
    'Seven' : IDL.Null,
    'Five' : IDL.Null,
    'Nine' : IDL.Null,
  });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const ChatMessage = IDL.Record({ 'content' : IDL.Text, 'role' : IDL.Text });
  const StewardPolicySummary = IDL.Record({
    'telemetry_oracle_id' : IDL.Principal,
    'governance_canister_id' : IDL.Principal,
    'required_signatures' : IDL.Nat,
  });
  const BountyPostResponse = IDL.Record({
    'message' : IDL.Text,
    'bounty_id' : IDL.Nat,
  });
  const StewardStatus = IDL.Variant({
    'Approved' : IDL.Null,
    'Executed' : IDL.Null,
    'Revoked' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const MilestoneTranche = IDL.Record({
    'id' : IDL.Nat,
    'status' : StewardStatus,
    'recipient' : IDL.Principal,
    'created_at' : IDL.Int,
    'amount_e8s' : IDL.Nat64,
    'steward' : IDL.Principal,
    'required_telemetry_metric' : IDL.Text,
    'partition' : IDL.Text,
    'signatures' : IDL.Vec(IDL.Principal),
  });
  const Result_3 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const BountyValue = IDL.Record({
    'id' : IDL.Nat,
    'current_reward' : IDL.Float64,
  });
  const TreasuryPartitionSummary = IDL.Record({
    'allocated' : IDL.Nat,
    'kind' : IDL.Text,
    'memo' : IDL.Text,
    'name' : IDL.Text,
    'released' : IDL.Nat,
    'available' : IDL.Nat,
  });
  const DisputeStatus = IDL.Variant({
    'Open' : IDL.Null,
    'Voting' : IDL.Null,
    'Resolved' : IDL.Null,
  });
  const DisputeVote = IDL.Variant({
    'Approve' : IDL.Null,
    'Reject' : IDL.Null,
  });
  const DisputeCase = IDL.Record({
    'id' : IDL.Nat,
    'status' : DisputeStatus,
    'jurors' : IDL.Vec(IDL.Principal),
    'claimant' : IDL.Principal,
    'votes' : IDL.Vec(IDL.Tuple(IDL.Principal, DisputeVote)),
    'tier' : DisputeTier,
    'bountyId' : IDL.Nat,
    'appealStake' : IDL.Nat,
  });
  const Result_2 = IDL.Variant({ 'ok' : DisputeCase, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : DisputeVote, 'err' : IDL.Text });
  const TreasuryRelease = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Text,
    'memo' : IDL.Text,
    'created_at' : IDL.Int,
    'partition' : IDL.Text,
    'amount' : IDL.Nat,
  });
  const Username = IDL.Text;
  const LoginResponse = IDL.Record({
    'merit' : IDL.Nat,
    'username' : IDL.Text,
    'message' : IDL.Text,
    'wallet' : IDL.Text,
  });
  const TreasuryActionResponse = IDL.Record({
    'release' : IDL.Opt(TreasuryRelease),
    'summary' : IDL.Opt(TreasuryPartitionSummary),
    'message' : IDL.Text,
    'partition' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  return IDL.Service({
    'appeal_dispute' : IDL.Func(
        [IDL.Nat, DisputeTier, IDL.Vec(IDL.Principal), IDL.Nat],
        [Result_4],
        [],
      ),
    'approve_tranche' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'chat' : IDL.Func([IDL.Vec(ChatMessage)], [IDL.Text], []),
    'check_for_deposits_and_mint_ckbtc' : IDL.Func([], [IDL.Text], []),
    'configure_ckbtc_canister' : IDL.Func([IDL.Principal], [IDL.Text], []),
    'configure_steward_policy' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [StewardPolicySummary],
        [],
      ),
    'createBounty' : IDL.Func(
        [IDL.Text, IDL.Float64, IDL.Float64],
        [BountyPostResponse],
        [],
      ),
    'create_dispute' : IDL.Func(
        [IDL.Nat, IDL.Principal, DisputeTier, IDL.Vec(IDL.Principal)],
        [Result_4],
        [],
      ),
    'create_tranche' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Nat64, IDL.Text],
        [MilestoneTranche],
        [],
      ),
    'execute_tranche_release' : IDL.Func([IDL.Nat], [Result_3], []),
    'getBountyValue' : IDL.Func([IDL.Nat], [IDL.Vec(BountyValue)], ['query']),
    'getBtcDepositAddress' : IDL.Func([], [IDL.Text], []),
    'get_active_stewards' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'get_commons_partitions' : IDL.Func(
        [],
        [IDL.Vec(TreasuryPartitionSummary)],
        ['query'],
      ),
    'get_dispute_case' : IDL.Func([IDL.Nat], [Result_2], ['query']),
    'get_dispute_verdict' : IDL.Func([IDL.Nat], [Result_1], ['query']),
    'get_steward_policy' : IDL.Func([], [StewardPolicySummary], ['query']),
    'get_tranches' : IDL.Func([], [IDL.Vec(MilestoneTranche)], ['query']),
    'get_treasury_releases' : IDL.Func(
        [],
        [IDL.Vec(TreasuryRelease)],
        ['query'],
      ),
    'is_ckbtc_canister_configured' : IDL.Func([], [IDL.Bool], ['query']),
    'login_or_register' : IDL.Func([Username], [LoginResponse], []),
    'record_telemetry_metric' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Bool],
        [IDL.Text],
        [],
      ),
    'register_commons_partition' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat, IDL.Text],
        [TreasuryPartitionSummary],
        [],
      ),
    'register_steward' : IDL.Func([IDL.Principal], [IDL.Text], []),
    'release_treasury' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Text],
        [TreasuryActionResponse],
        [],
      ),
    'revoke_tranche' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'submit_dispute_vote' : IDL.Func([IDL.Nat, DisputeVote], [Result], []),
    'unregister_steward' : IDL.Func([IDL.Principal], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
