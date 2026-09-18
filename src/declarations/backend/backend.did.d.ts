import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface ChatMessage { 'content' : string, 'role' : string }
export interface LoginResponse {
  'merit' : bigint,
  'username' : string,
  'message' : string,
  'wallet' : string,
}
export interface TreasuryActionResponse {
  'message' : string,
  'partition' : string,
  'release' : [] | [TreasuryRelease],
  'summary' : [] | [TreasuryPartitionSummary],
}
export interface TreasuryPartitionSummary {
  'allocated' : bigint,
  'available' : bigint,
  'kind' : string,
  'memo' : string,
  'name' : string,
  'released' : bigint,
}
export interface TreasuryRelease {
  'amount' : bigint,
  'created_at' : bigint,
  'id' : bigint,
  'memo' : string,
  'partition' : string,
  'status' : string,
}
export type StewardStatus =
  { 'Pending' : null } |
  { 'Approved' : null } |
  { 'Executed' : null } |
  { 'Revoked' : null };
export interface MilestoneTranche {
  'amount_e8s' : bigint,
  'created_at' : bigint,
  'id' : bigint,
  'partition' : string,
  'recipient' : Principal,
  'required_telemetry_metric' : string,
  'signatures' : Array<Principal>,
  'status' : StewardStatus,
  'steward' : Principal,
}
export interface StewardPolicySummary {
  'governance_canister_id' : Principal,
  'required_signatures' : bigint,
  'telemetry_oracle_id' : Principal,
}
export type Result = { 'ok' : string } | { 'err' : string };
export type Username = string;
export interface _SERVICE {
  'approve_tranche' : ActorMethod<[bigint], string>,
  'chat' : ActorMethod<[Array<ChatMessage>], string>,
  'configure_steward_policy' : ActorMethod<[Principal, Principal, bigint], StewardPolicySummary>,
  'create_tranche' : ActorMethod<[Principal, string, bigint, string], MilestoneTranche>,
  'execute_tranche_release' : ActorMethod<[bigint], Result>,
  'get_active_stewards' : ActorMethod<[], Array<Principal>>,
  'get_commons_partitions' : ActorMethod<[], Array<TreasuryPartitionSummary>>,
  'get_steward_policy' : ActorMethod<[], StewardPolicySummary>,
  'get_tranches' : ActorMethod<[], Array<MilestoneTranche>>,
  'get_treasury_releases' : ActorMethod<[], Array<TreasuryRelease>>,
  'login_or_register' : ActorMethod<[Username], LoginResponse>,
  'record_telemetry_metric' : ActorMethod<[Principal, string, boolean], string>,
  'register_commons_partition' : ActorMethod<[string, string, bigint, string], TreasuryPartitionSummary>,
  'register_steward' : ActorMethod<[Principal], string>,
  'revoke_tranche' : ActorMethod<[bigint], string>,
  'release_treasury' : ActorMethod<[string, bigint, string], TreasuryActionResponse>,
  'unregister_steward' : ActorMethod<[Principal], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
