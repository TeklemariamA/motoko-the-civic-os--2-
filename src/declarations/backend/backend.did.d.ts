import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface BountyPostResponse { 'message' : string, 'bounty_id' : bigint }
export interface BountyValue { 'id' : bigint, 'current_reward' : number }
export interface ChatMessage { 'content' : string, 'role' : string }
export interface DisputeCase {
  'id' : bigint,
  'status' : DisputeStatus,
  'jurors' : Array<Principal>,
  'claimant' : Principal,
  'votes' : Array<[Principal, DisputeVote]>,
  'tier' : DisputeTier,
  'bountyId' : bigint,
  'appealStake' : bigint,
}
export type DisputeStatus = { 'Open' : null } |
  { 'Voting' : null } |
  { 'Resolved' : null };
export type DisputeTier = { 'Seven' : null } |
  { 'Five' : null } |
  { 'Nine' : null };
export type DisputeVote = { 'Approve' : null } |
  { 'Reject' : null };
export interface LoginResponse {
  'merit' : bigint,
  'username' : string,
  'message' : string,
  'wallet' : string,
}
export interface MilestoneTranche {
  'id' : bigint,
  'status' : StewardStatus,
  'recipient' : Principal,
  'created_at' : bigint,
  'amount_e8s' : bigint,
  'steward' : Principal,
  'required_telemetry_metric' : string,
  'partition' : string,
  'signatures' : Array<Principal>,
}
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : DisputeVote } |
  { 'err' : string };
export type Result_2 = { 'ok' : DisputeCase } |
  { 'err' : string };
export type Result_3 = { 'ok' : string } |
  { 'err' : string };
export type Result_4 = { 'ok' : bigint } |
  { 'err' : string };
export interface StewardPolicySummary {
  'telemetry_oracle_id' : Principal,
  'governance_canister_id' : Principal,
  'required_signatures' : bigint,
}
export type StewardStatus = { 'Approved' : null } |
  { 'Executed' : null } |
  { 'Revoked' : null } |
  { 'Pending' : null };
export interface TreasuryActionResponse {
  'release' : [] | [TreasuryRelease],
  'summary' : [] | [TreasuryPartitionSummary],
  'message' : string,
  'partition' : string,
}
export interface TreasuryPartitionSummary {
  'allocated' : bigint,
  'kind' : string,
  'memo' : string,
  'name' : string,
  'released' : bigint,
  'available' : bigint,
}
export interface TreasuryRelease {
  'id' : bigint,
  'status' : string,
  'memo' : string,
  'created_at' : bigint,
  'partition' : string,
  'amount' : bigint,
}
export type Username = string;
export interface _SERVICE {
  'appeal_dispute' : ActorMethod<
    [bigint, DisputeTier, Array<Principal>, bigint],
    Result_4
  >,
  'approve_tranche' : ActorMethod<[bigint], string>,
  'chat' : ActorMethod<[Array<ChatMessage>], string>,
  'check_for_deposits_and_mint_ckbtc' : ActorMethod<[], string>,
  'configure_ckbtc_canister' : ActorMethod<[Principal], string>,
  'configure_steward_policy' : ActorMethod<
    [Principal, Principal, bigint],
    StewardPolicySummary
  >,
  'createBounty' : ActorMethod<[string, number, number], BountyPostResponse>,
  'create_dispute' : ActorMethod<
    [bigint, Principal, DisputeTier, Array<Principal>],
    Result_4
  >,
  'create_tranche' : ActorMethod<
    [Principal, string, bigint, string],
    MilestoneTranche
  >,
  'execute_tranche_release' : ActorMethod<[bigint], Result_3>,
  'getBountyValue' : ActorMethod<[bigint], Array<BountyValue>>,
  'getBtcDepositAddress' : ActorMethod<[], string>,
  'get_active_stewards' : ActorMethod<[], Array<Principal>>,
  'get_commons_partitions' : ActorMethod<[], Array<TreasuryPartitionSummary>>,
  'get_dispute_case' : ActorMethod<[bigint], Result_2>,
  'get_dispute_verdict' : ActorMethod<[bigint], Result_1>,
  'get_steward_policy' : ActorMethod<[], StewardPolicySummary>,
  'get_tranches' : ActorMethod<[], Array<MilestoneTranche>>,
  'get_treasury_releases' : ActorMethod<[], Array<TreasuryRelease>>,
  'is_ckbtc_canister_configured' : ActorMethod<[], boolean>,
  'login_or_register' : ActorMethod<[Username], LoginResponse>,
  'record_telemetry_metric' : ActorMethod<[Principal, string, boolean], string>,
  'register_commons_partition' : ActorMethod<
    [string, string, bigint, string],
    TreasuryPartitionSummary
  >,
  'register_steward' : ActorMethod<[Principal], string>,
  'release_treasury' : ActorMethod<
    [string, bigint, string],
    TreasuryActionResponse
  >,
  'revoke_tranche' : ActorMethod<[bigint], string>,
  'submit_dispute_vote' : ActorMethod<[bigint, DisputeVote], Result>,
  'unregister_steward' : ActorMethod<[Principal], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
