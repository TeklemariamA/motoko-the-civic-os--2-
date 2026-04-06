import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface AuditEntry {
  'verified' : boolean,
  'action' : string,
  'proof_signature' : string,
  'timestamp' : bigint,
}
export interface Bill {
  'id' : bigint,
  'status' : string,
  'title' : string,
  'abstain_votes' : bigint,
  'yes_votes' : bigint,
  'body' : string,
  'created_at' : bigint,
  'author' : string,
  'category' : string,
  'no_votes' : bigint,
  'forked_from' : [] | [bigint],
}
export interface Member {
  'bio' : string,
  'merit' : bigint,
  'name' : string,
  'role' : string,
  'joined_at' : bigint,
  'is_active' : boolean,
}
export interface ResearchRecord {
  'id' : bigint,
  'title' : string,
  'domain' : string,
  'created_at' : bigint,
  'author' : string,
  'data_hash' : string,
  'abstract_text' : string,
}
export interface SkillCommit {
  'id' : bigint,
  'member' : string,
  'evidence_hash' : string,
  'created_at' : bigint,
  'endorsements' : Array<string>,
  'skill' : string,
}
export interface _SERVICE {
  /**
   * / Cast a verdict as a juror.
   * / Once all jurors have voted, Schelling-point consensus resolves the case
   * / and redistributes merit to honest jurors.
   * / Returns null if the case does not exist or the caller is not an assigned juror.
   */
  'castVerdict' : ActorMethod<
    [bigint, string, string],
    [] | [{ 'verdict' : string, 'message' : string }]
  >,
  /**
   * / Cast a vote on an active bill.
   * / choice must be "yes", "no", or "abstain".
   * / A bill automatically commits (passes) once yes votes strictly exceed 50 % of
   * / all participating votes (yes + no), implementing the 50+1 majority rule.
   * / Returns null if the bill is not found or the citizen has already voted.
   */
  'castVote' : ActorMethod<
    [bigint, string, string],
    [] | [
      {
        'no' : bigint,
        'yes' : bigint,
        'status' : string,
        'abstain' : bigint,
        'message' : string,
      }
    ]
  >,
  /**
   * / Commit a verifiable skill to the Knowledge Commons.
   * / Any enrolled member can commit skills; evidence is stored as a content hash.
   * / Returns null if the member is not enrolled.
   */
  'commitSkill' : ActorMethod<
    [string, string, string],
    [] | [{ 'skill_id' : bigint, 'message' : string }]
  >,
  /**
   * / Post a new time-escalating bounty to the grid.
   */
  'createBounty' : ActorMethod<
    [string, number, number],
    { 'message' : string, 'bounty_id' : bigint }
  >,
  /**
   * / Endorse a skill commit on behalf of another member.
   * / A member cannot endorse their own skill. Returns null if skill or endorser not found.
   */
  'endorseSkill' : ActorMethod<
    [bigint, string],
    [] | [
      { 'endorsement_count' : bigint, 'skill_id' : bigint, 'message' : string }
    ]
  >,
  /**
   * / Enroll a new citizen in the Social OS.
   * / Returns an error message if the name is already taken.
   */
  'enrollMember' : ActorMethod<
    [string, string, string],
    { 'ok' : boolean, 'message' : string }
  >,
  /**
   * / File a new case and assign jurors via merit-weighted sortition.
   */
  'fileCase' : ActorMethod<
    [string, string, string, string],
    { 'jury' : Array<string>, 'case_id' : bigint }
  >,
  /**
   * / Fork an existing bill into a new variant with amended title and body.
   * / The fork starts with 0 votes and status "active".
   * / Returns null if the original bill does not exist.
   */
  'forkBill' : ActorMethod<
    [bigint, string, string, string],
    [] | [{ 'bill_id' : bigint, 'message' : string }]
  >,
  /**
   * / Return a single bill by ID.
   */
  'getBill' : ActorMethod<[bigint], [] | [Bill]>,
  /**
   * / Return the current (time-escalated) reward for a bounty.
   * / Returns null if the bounty does not exist.
   */
  'getBountyValue' : ActorMethod<
    [bigint],
    [] | [{ 'id' : bigint, 'current_reward' : number }]
  >,
  /**
   * / Return a member profile by name.
   */
  'getMember' : ActorMethod<[string], [] | [Member]>,
  /**
   * / Return all bills (active, passed, rejected).
   */
  'listBills' : ActorMethod<[], Array<Bill>>,
  /**
   * / Return all enrolled members.
   */
  'listMembers' : ActorMethod<[], Array<Member>>,
  /**
   * / Return all open-science research records.
   */
  'listResearch' : ActorMethod<[], Array<ResearchRecord>>,
  /**
   * / Return all skill commits for a given member.
   */
  'listSkillCommits' : ActorMethod<[string], Array<SkillCommit>>,
  /**
   * / Submit a zero-knowledge proof of a private action.
   * / The action is recorded on the public ledger under the proof hash, not the user's identity.
   */
  'privateAction' : ActorMethod<[string, string], { 'message' : string }>,
  /**
   * / Propose a new bill for the community to vote on.
   */
  'proposeBill' : ActorMethod<
    [string, string, string, string],
    { 'bill_id' : bigint, 'message' : string }
  >,
  /**
   * / Return the full public audit log.
   * / Anyone can see WHAT happened, but identities are hidden behind proof hashes.
   */
  'publicLog' : ActorMethod<[], Array<AuditEntry>>,
  /**
   * / Publish a research record to the open-science commons.
   * / Per the Human Source Code principle: all publicly relevant knowledge is immediately public.
   */
  'publishResearch' : ActorMethod<
    [string, string, string, string, string],
    { 'research_id' : bigint, 'message' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
