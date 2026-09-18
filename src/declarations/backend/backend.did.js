export const idlFactory = ({ IDL }) => {
  const ChatMessage = IDL.Record({ 'content' : IDL.Text, 'role' : IDL.Text });
  const Username = IDL.Text;
  const LoginResponse = IDL.Record({
    'merit' : IDL.Nat,
    'username' : IDL.Text,
    'message' : IDL.Text,
    'wallet' : IDL.Text,
  });
  const TreasuryPartitionSummary = IDL.Record({
    'allocated' : IDL.Nat,
    'available' : IDL.Nat,
    'kind' : IDL.Text,
    'memo' : IDL.Text,
    'name' : IDL.Text,
    'released' : IDL.Nat,
  });
  const TreasuryRelease = IDL.Record({
    'amount' : IDL.Nat,
    'created_at' : IDL.Int,
    'id' : IDL.Nat,
    'memo' : IDL.Text,
    'partition' : IDL.Text,
    'status' : IDL.Text,
  });
  const TreasuryActionResponse = IDL.Record({
    'message' : IDL.Text,
    'partition' : IDL.Text,
    'release' : IDL.Opt(TreasuryRelease),
    'summary' : IDL.Opt(TreasuryPartitionSummary),
  });
  const StewardStatus = IDL.Variant({
    'Pending' : IDL.Null,
    'Approved' : IDL.Null,
    'Executed' : IDL.Null,
    'Revoked' : IDL.Null,
  });
  const MilestoneTranche = IDL.Record({
    'amount_e8s' : IDL.Nat64,
    'created_at' : IDL.Int,
    'id' : IDL.Nat,
    'partition' : IDL.Text,
    'recipient' : IDL.Principal,
    'required_telemetry_metric' : IDL.Text,
    'signatures' : IDL.Vec(IDL.Principal),
    'status' : StewardStatus,
    'steward' : IDL.Principal,
  });
  const StewardPolicySummary = IDL.Record({
    'governance_canister_id' : IDL.Principal,
    'required_signatures' : IDL.Nat,
    'telemetry_oracle_id' : IDL.Principal,
  });
  const DisputeTier = IDL.Variant({ 'Five' : IDL.Null, 'Seven' : IDL.Null, 'Nine' : IDL.Null });
  const DisputeVote = IDL.Variant({ 'Approve' : IDL.Null, 'Reject' : IDL.Null });
  const DisputeStatus = IDL.Variant({ 'Open' : IDL.Null, 'Voting' : IDL.Null, 'Resolved' : IDL.Null });
  const DisputeCase = IDL.Record({
    'appealStake' : IDL.Nat,
    'bountyId' : IDL.Nat,
    'claimant' : IDL.Principal,
    'id' : IDL.Nat,
    'jurors' : IDL.Vec(IDL.Principal),
    'status' : DisputeStatus,
    'tier' : DisputeTier,
    'votes' : IDL.Vec(IDL.Tuple(IDL.Principal, DisputeVote)),
  });
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  return IDL.Service({
    'appeal_dispute' : IDL.Func([IDL.Nat, DisputeTier, IDL.Vec(IDL.Principal), IDL.Nat], [Result], []),
    'approve_tranche' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'chat' : IDL.Func([IDL.Vec(ChatMessage)], [IDL.Text], []),
    'check_for_deposits_and_mint_ckbtc' : IDL.Func([], [IDL.Text], []),
    'configure_ckbtc_canister' : IDL.Func([IDL.Principal], [IDL.Text], []),
    'configure_steward_policy' : IDL.Func([IDL.Principal, IDL.Principal, IDL.Nat], [StewardPolicySummary], []),
    'create_dispute' : IDL.Func([IDL.Nat, IDL.Principal, DisputeTier, IDL.Vec(IDL.Principal)], [Result], []),
    'create_tranche' : IDL.Func([IDL.Principal, IDL.Text, IDL.Nat64, IDL.Text], [MilestoneTranche], []),
    'execute_tranche_release' : IDL.Func([IDL.Nat], [Result], []),
    'getBtcDepositAddress' : IDL.Func([], [IDL.Text], []),
    'is_ckbtc_canister_configured' : IDL.Func([], [IDL.Bool], ['query']),
    'get_active_stewards' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'get_commons_partitions' : IDL.Func([], [IDL.Vec(TreasuryPartitionSummary)], ['query']),
    'get_dispute_case' : IDL.Func([IDL.Nat], [Result], ['query']),
    'get_dispute_verdict' : IDL.Func([IDL.Nat], [Result], ['query']),
    'get_steward_policy' : IDL.Func([], [StewardPolicySummary], ['query']),
    'get_tranches' : IDL.Func([], [IDL.Vec(MilestoneTranche)], ['query']),
    'get_treasury_releases' : IDL.Func([], [IDL.Vec(TreasuryRelease)], ['query']),
    'login_or_register' : IDL.Func([Username], [LoginResponse], []),
    'record_telemetry_metric' : IDL.Func([IDL.Principal, IDL.Text, IDL.Bool], [IDL.Text], []),
    'register_commons_partition' : IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Text], [TreasuryPartitionSummary], []),
    'register_steward' : IDL.Func([IDL.Principal], [IDL.Text], []),
    'revoke_tranche' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'release_treasury' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [TreasuryActionResponse], []),
    'submit_dispute_vote' : IDL.Func([IDL.Nat, DisputeVote], [Result], []),
    'unregister_steward' : IDL.Func([IDL.Principal], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
