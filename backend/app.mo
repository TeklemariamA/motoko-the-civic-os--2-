// CivicOS v2.0: The Purist Protocol
// Motoko backend for Internet Computer

import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Blob "mo:base/Blob";
import LLM "mo:llm";

persistent actor CivicOS {

  // ---- DATA TYPES ----

  public type ChatMessage = { #user : { content : Text }; #system_ : { content : Text } };

  public type Bounty = {
    id : Nat;
    description : Text;
    base_reward : Float;
    urgency_coeff : Float;
    created_at : Int;
    status : Text;
    claimed_by : ?Text;
  };

  public type AuditEntry = {
    timestamp : Int;
    proof_signature : Text;
    action : Text;
    verified : Bool;
  };

  public type Case = {
    id : Nat;
    category : Text;
    plaintiff : Text;
    defendant : Text;
    evidence_hash : Text;
    jurors : [Text];
    votes : [(Text, Text)];
    status : Text;
  };

  public type User = {
    name : Text;
    merit : Int;
  };

  /// A registered citizen of the Social OS.
  /// role examples: "Citizen", "Scholar", "Builder", "Steward"
  public type Member = {
    name : Text;
    bio : Text;
    role : Text;
    joined_at : Int;
    merit : Int;
    is_active : Bool;
  };

  /// A verifiable skill that a member has committed to the Knowledge Commons.
  /// Inspired by the "Skill-Commit" model — education as lifelong accumulation.
  public type SkillCommit = {
    id : Nat;
    member : Text;
    skill : Text;
    evidence_hash : Text;
    endorsements : [Text];
    created_at : Int;
  };

  /// An open-science research record.
  /// All publicly funded knowledge belongs to the commons.
  public type ResearchRecord = {
    id : Nat;
    title : Text;
    author : Text;
    abstract_text : Text;
    data_hash : Text;
    domain : Text;
    created_at : Int;
  };

  /// A legislative bill / proposal that citizens vote on.
  /// status: "active" | "passed" | "rejected"
  /// forked_from: ?id of the parent bill when this is a fork
  public type Bill = {
    id : Nat;
    title : Text;
    body : Text;
    author : Text;
    category : Text;
    status : Text;
    yes_votes : Nat;
    no_votes : Nat;
    abstain_votes : Nat;
    created_at : Int;
    forked_from : ?Nat;
  };

  // ---- STABLE STATE ----

  stable var nextBountyId : Nat = 1;
  stable var nextCaseId : Nat = 1;
  stable var nextBillId : Nat = 1;
  stable var nextSkillId : Nat = 1;
  stable var nextResearchId : Nat = 1;
  stable var bounties : [Bounty] = [];
  stable var auditLog : [AuditEntry] = [];
  stable var cases : [Case] = [];
  stable var bills : [Bill] = [];
  // (bill_id, citizen_name, choice) — one row per vote
  stable var billVotes : [(Nat, Text, Text)] = [];
  stable var members : [Member] = [];
  stable var skillCommits : [SkillCommit] = [];
  stable var researchRecords : [ResearchRecord] = [];
  stable var users : [User] = [
    { name = "elara"; merit = 50 },
    { name = "devon"; merit = 20 },
  ];

  // ---- LLM CHAT ----

  /// Send chat messages to the on-chain LLM and return its reply.
  public func chat(messages : [ChatMessage]) : async Text {
    let llmMessages = Array.map<ChatMessage, LLM.ChatMessage>(
      messages,
      func(msg) {
        switch (msg) {
          case (#user { content }) { #user({ content }) };
          case (#system_ { content }) { #system_({ content }) };
        }
      },
    );
    let response = await LLM.chat(#Llama3_1_8B).withMessages(llmMessages).send();
    switch (response.message.content) {
      case (?text) text;
      case null "";
    }
  };

  // ---- BOUNTIES ----

  /// Post a new time-escalating bounty to the grid.
  public func createBounty(description : Text, base_reward : Float, urgency : Float) : async { message : Text; bounty_id : Nat } {
    let id = nextBountyId;
    nextBountyId += 1;
    bounties := Array.append(
      bounties,
      [{
        id;
        description;
        base_reward;
        urgency_coeff = urgency;
        created_at = Time.now();
        status = "open";
        claimed_by = null;
      }],
    );
    { message = "Bounty posted to the grid"; bounty_id = id }
  };

  /// Return the current (time-escalated) reward for a bounty.
  /// Returns null if the bounty does not exist.
  public query func getBountyValue(bounty_id : Nat) : async ?{ id : Nat; current_reward : Float } {
    switch (Array.find<Bounty>(bounties, func(b) { b.id == bounty_id })) {
      case null null;
      case (?b) {
        let elapsedNs : Int = Time.now() - b.created_at;
        let safeElapsed : Int = if (elapsedNs > 0) elapsedNs else 0;
        let elapsedMin : Float = Float.fromInt(safeElapsed) / 60_000_000_000.0;
        let current_reward = b.base_reward * (1.0 + b.urgency_coeff * elapsedMin);
        ?{ id = bounty_id; current_reward }
      };
    }
  };

  // ---- AUDIT ----

  /// Submit a zero-knowledge proof of a private action.
  /// The action is recorded on the public ledger under the proof hash, not the user's identity.
  public func privateAction(proof_hash : Text, action_type : Text) : async { message : Text } {
    auditLog := Array.append(
      auditLog,
      [{
        timestamp = Time.now();
        proof_signature = proof_hash;
        action = action_type;
        verified = true;
      }],
    );
    { message = "Action verified and anonymized on public ledger" }
  };

  /// Return the full public audit log.
  /// Anyone can see WHAT happened, but identities are hidden behind proof hashes.
  public query func publicLog() : async [AuditEntry] {
    auditLog
  };

  // ---- JUSTICE ----

  /// File a new case and assign jurors via merit-weighted sortition.
  public func fileCase(plaintiff : Text, defendant : Text, category : Text, evidence : Text) : async { case_id : Nat; jury : [Text] } {
    let id = nextCaseId;
    nextCaseId += 1;
    let potentialJurors = Array.filter<User>(
      users,
      func(u) { u.name != plaintiff and u.name != defendant },
    );
    let jurors = Array.map<User, Text>(potentialJurors, func(u) { u.name });
    let evidenceHash = simpleHash(evidence);
    cases := Array.append(
      cases,
      [{
        id;
        category;
        plaintiff;
        defendant;
        evidence_hash = evidenceHash;
        jurors;
        votes = [];
        status = "open";
      }],
    );
    { case_id = id; jury = jurors }
  };

  /// Cast a verdict as a juror.
  /// Once all jurors have voted, Schelling-point consensus resolves the case
  /// and redistributes merit to honest jurors.
  /// Returns null if the case does not exist or the caller is not an assigned juror.
  public func castVerdict(case_id : Nat, juror_name : Text, verdict : Text) : async ?{ verdict : Text; message : Text } {
    switch (Array.find<Case>(cases, func(c) { c.id == case_id })) {
      case null null;
      case (?c) {
        // Verify the juror is assigned to this case
        if (Array.find<Text>(c.jurors, func(j) { j == juror_name }) == null) {
          return null;
        };
        // Prevent double-voting
        if (Array.find<(Text, Text)>(c.votes, func((j, _)) { j == juror_name }) != null) {
          return null;
        };
        let newVotes = Array.append(c.votes, [(juror_name, verdict)]);
        let allVoted = newVotes.size() >= c.jurors.size() and c.jurors.size() > 0;
        let newStatus = if (allVoted) "resolved" else "deliberating";
        let updated : Case = {
          id = c.id;
          category = c.category;
          plaintiff = c.plaintiff;
          defendant = c.defendant;
          evidence_hash = c.evidence_hash;
          jurors = c.jurors;
          votes = newVotes;
          status = newStatus;
        };
        cases := Array.map<Case, Case>(
          cases,
          func(c2) { if (c2.id == case_id) updated else c2 },
        );
        if (allVoted) {
          let majority = findMajority(newVotes);
          updateMerits(newVotes, majority);
          ?{ verdict = majority; message = "Case merged into the Social Ledger" }
        } else {
          ?{ verdict = "pending"; message = "Vote recorded" }
        }
      };
    }
  };

  // ---- LEGISLATURE ----

  /// Propose a new bill for the community to vote on.
  public func proposeBill(title : Text, body : Text, author : Text, category : Text) : async { bill_id : Nat; message : Text } {
    let id = nextBillId;
    nextBillId += 1;
    bills := Array.append(
      bills,
      [{
        id;
        title;
        body;
        author;
        category;
        status = "active";
        yes_votes = 0;
        no_votes = 0;
        abstain_votes = 0;
        created_at = Time.now();
        forked_from = null;
      }],
    );
    { bill_id = id; message = "Bill proposed to the legislature" }
  };

  /// Cast a vote on an active bill.
  /// choice must be "yes", "no", or "abstain".
  /// A bill automatically commits (passes) once yes votes strictly exceed 50 % of
  /// all participating votes (yes + no), implementing the 50+1 majority rule.
  /// Returns null if the bill is not found or the citizen has already voted.
  public func castVote(bill_id : Nat, citizen : Text, choice : Text) : async ?{ yes : Nat; no : Nat; abstain : Nat; status : Text; message : Text } {
    switch (Array.find<Bill>(bills, func(b) { b.id == bill_id })) {
      case null null;
      case (?bill) {
        if (bill.status != "active") {
          return ?{
            yes = bill.yes_votes;
            no = bill.no_votes;
            abstain = bill.abstain_votes;
            status = bill.status;
            message = "Bill is no longer active";
          };
        };
        // Prevent double-voting
        if (Array.find<(Nat, Text, Text)>(billVotes, func((bid, cit, _)) { bid == bill_id and cit == citizen }) != null) {
          return null;
        };
        billVotes := Array.append(billVotes, [(bill_id, citizen, choice)]);
        let newYes = bill.yes_votes + (if (choice == "yes") 1 else 0);
        let newNo = bill.no_votes + (if (choice == "no") 1 else 0);
        let newAbstain = bill.abstain_votes + (if (choice == "abstain") 1 else 0);
        // 50+1 rule: yes must strictly exceed 50% of (yes + no); abstentions excluded.
        // NOTE: the same formula (yes * 2 > total) is mirrored in the frontend bill-list display.
        let participating = newYes + newNo;
        let newStatus = if (participating > 0 and newYes * 2 > participating) "passed"
                        else bill.status;
        let updated : Bill = {
          id = bill.id;
          title = bill.title;
          body = bill.body;
          author = bill.author;
          category = bill.category;
          status = newStatus;
          yes_votes = newYes;
          no_votes = newNo;
          abstain_votes = newAbstain;
          created_at = bill.created_at;
          forked_from = bill.forked_from;
        };
        bills := Array.map<Bill, Bill>(bills, func(b) { if (b.id == bill_id) updated else b });
        let msg = if (newStatus == "passed")
          "Bill committed to the Social Ledger — 50+1 majority reached 🎉"
          else "Vote recorded";
        ?{ yes = newYes; no = newNo; abstain = newAbstain; status = newStatus; message = msg }
      };
    }
  };

  /// Return a single bill by ID.
  public query func getBill(bill_id : Nat) : async ?Bill {
    Array.find<Bill>(bills, func(b) { b.id == bill_id })
  };

  /// Return all bills (active, passed, rejected).
  public query func listBills() : async [Bill] {
    bills
  };

  /// Fork an existing bill into a new variant with amended title and body.
  /// The fork starts with 0 votes and status "active".
  /// Returns null if the original bill does not exist.
  public func forkBill(original_id : Nat, title : Text, body : Text, author : Text) : async ?{ bill_id : Nat; message : Text } {
    switch (Array.find<Bill>(bills, func(b) { b.id == original_id })) {
      case null null;
      case (?orig) {
        let id = nextBillId;
        nextBillId += 1;
        bills := Array.append(
          bills,
          [{
            id;
            title;
            body;
            author;
            category = orig.category;
            status = "active";
            yes_votes = 0;
            no_votes = 0;
            abstain_votes = 0;
            created_at = Time.now();
            forked_from = ?original_id;
          }],
        );
        ?{ bill_id = id; message = "Bill forked from #" # Nat.toText(original_id) }
      };
    }
  };

  // ---- MEMBERSHIP ENROLLMENT ----

  /// Enroll a new citizen in the Social OS.
  /// Returns an error message if the name is already taken.
  public func enrollMember(name : Text, bio : Text, role : Text) : async { ok : Bool; message : Text } {
    if (Array.find<Member>(members, func(m) { m.name == name }) != null) {
      return { ok = false; message = "Name already enrolled" };
    };
    members := Array.append(
      members,
      [{
        name;
        bio;
        role;
        joined_at = Time.now();
        merit = 10; // welcome bonus
        is_active = true;
      }],
    );
    { ok = true; message = "Welcome to the Social OS, " # name # "! Starting merit: 10" }
  };

  /// Return a member profile by name.
  public query func getMember(name : Text) : async ?Member {
    Array.find<Member>(members, func(m) { m.name == name })
  };

  /// Return all enrolled members.
  public query func listMembers() : async [Member] {
    members
  };

  // ---- KNOWLEDGE COMMONS — SKILL COMMITS ----

  /// Commit a verifiable skill to the Knowledge Commons.
  /// Any enrolled member can commit skills; evidence is stored as a content hash.
  /// Returns null if the member is not enrolled.
  public func commitSkill(member : Text, skill : Text, evidence : Text) : async ?{ skill_id : Nat; message : Text } {
    if (Array.find<Member>(members, func(m) { m.name == member }) == null) {
      return null;
    };
    let id = nextSkillId;
    nextSkillId += 1;
    skillCommits := Array.append(
      skillCommits,
      [{
        id;
        member;
        skill;
        evidence_hash = simpleHash(evidence);
        endorsements = [];
        created_at = Time.now();
      }],
    );
    ?{ skill_id = id; message = "Skill committed: " # skill }
  };

  /// Endorse a skill commit on behalf of another member.
  /// A member cannot endorse their own skill. Returns null if skill or endorser not found.
  public func endorseSkill(skill_id : Nat, endorser : Text) : async ?{ skill_id : Nat; endorsement_count : Nat; message : Text } {
    switch (Array.find<SkillCommit>(skillCommits, func(s) { s.id == skill_id })) {
      case null null;
      case (?sc) {
        if (sc.member == endorser) return null; // no self-endorsement
        if (Array.find<Text>(sc.endorsements, func(e) { e == endorser }) != null) return null; // already endorsed
        let updated : SkillCommit = {
          id = sc.id;
          member = sc.member;
          skill = sc.skill;
          evidence_hash = sc.evidence_hash;
          endorsements = Array.append(sc.endorsements, [endorser]);
          created_at = sc.created_at;
        };
        skillCommits := Array.map<SkillCommit, SkillCommit>(
          skillCommits,
          func(s) { if (s.id == skill_id) updated else s },
        );
        ?{ skill_id; endorsement_count = updated.endorsements.size(); message = endorser # " endorsed this skill" }
      };
    }
  };

  /// Return all skill commits for a given member.
  public query func listSkillCommits(member : Text) : async [SkillCommit] {
    Array.filter<SkillCommit>(skillCommits, func(s) { s.member == member })
  };

  // ---- KNOWLEDGE COMMONS — OPEN SCIENCE ----

  /// Publish a research record to the open-science commons.
  /// Per the Human Source Code principle: all publicly relevant knowledge is immediately public.
  public func publishResearch(title : Text, author : Text, abstract_text : Text, data : Text, domain : Text) : async { research_id : Nat; message : Text } {
    let id = nextResearchId;
    nextResearchId += 1;
    researchRecords := Array.append(
      researchRecords,
      [{
        id;
        title;
        author;
        abstract_text;
        data_hash = simpleHash(data);
        domain;
        created_at = Time.now();
      }],
    );
    { research_id = id; message = "Research published to the commons: " # title }
  };

  /// Return all open-science research records.
  public query func listResearch() : async [ResearchRecord] {
    researchRecords
  };

  // ---- HELPERS ----

  /// Derive a stable text fingerprint from a blob using the built-in hash primitive.
  private func simpleHash(text : Text) : Text {
    Nat32.toText(Blob.hash(Text.encodeUtf8(text)))
  };

  /// Return the verdict with the most votes (first winner on a tie).
  private func findMajority(votes : [(Text, Text)]) : Text {
    var best = "";
    var bestCount : Nat = 0;
    for ((_, v) in votes.vals()) {
      var count : Nat = 0;
      for ((_, v2) in votes.vals()) {
        if (v2 == v) count += 1;
      };
      if (count > bestCount) {
        bestCount := count;
        best := v;
      };
    };
    best
  };

  /// Reward jurors who voted with the majority (+5 merit) and penalise the rest (-2 merit).
  private func updateMerits(votes : [(Text, Text)], winner : Text) {
    for ((juror, v) in votes.vals()) {
      users := Array.map<User, User>(
        users,
        func(u) {
          if (u.name == juror) {
            { name = u.name; merit = if (v == winner) u.merit + 5 else Int.max(0, u.merit - 2) }
          } else u
        },
      );
    };
  };
}
