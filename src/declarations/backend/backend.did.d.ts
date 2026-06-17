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
export type Username = string;
export interface _SERVICE {
  'chat' : ActorMethod<[Array<ChatMessage>], string>,
  'login_or_register' : ActorMethod<[Username], LoginResponse>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
