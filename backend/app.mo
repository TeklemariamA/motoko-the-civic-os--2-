import Text "mo:base/Text";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Array "mo:base/Array";
import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

persistent actor {
  public type Username = Text;

  public type UserData = {
    merit : Nat;
    salt : Text;
    wallet : Text;
  };

  public type ChatMessage = {
    role : Text;
    content : Text;
  };

  public type LoginResponse = {
    message : Text;
    username : Text;
    wallet : Text;
    merit : Nat;
  };

  public type TreasuryPartition = {
    name : Text;
    kind : Text;
    allocated : Nat;
    released : Nat;
    memo : Text;
  };

  public type TreasuryRelease = {
    id : Nat;
    partition : Text;
    amount : Nat;
    memo : Text;
    created_at : Int;
    status : Text;
  };

  public type TreasuryPartitionSummary = {
    name : Text;
    kind : Text;
    allocated : Nat;
    released : Nat;
    available : Nat;
    memo : Text;
  };

  public type TreasuryActionResponse = {
    message : Text;
    partition : Text;
    release : ?TreasuryRelease;
    summary : ?TreasuryPartitionSummary;
  };

  public type StewardStatus = {
    #Pending;
    #Approved;
    #Executed;
    #Revoked;
  };

  public type MilestoneTranche = {
    id : Nat;
    steward : Principal;
    recipient : Principal;
    partition : Text;
    amount_e8s : Nat64;
    required_telemetry_metric : Text;
    signatures : [Principal];
    status : StewardStatus;
    created_at : Int;
  };

  public type StewardPolicySummary = {
    governance_canister_id : Principal;
    telemetry_oracle_id : Principal;
    required_signatures : Nat;
  };

  public type DisputeTier = {
    #Five;
    #Seven;
    #Nine;
  };

  public type DisputeVote = {
    #Approve;
    #Reject;
  };

  public type DisputeStatus = {
    #Open;
    #Voting;
    #Resolved;
  };

  public type DisputeCase = {
    id : Nat;
    bountyId : Nat;
    claimant : Principal;
    tier : DisputeTier;
    status : DisputeStatus;
    jurors : [Principal];
    votes : [(Principal, DisputeVote)];
    appealStake : Nat;
  };

  public type Bounty = {
    id : Nat;
    description : Text;
    base_reward : Float;
    urgency_coeff : Float;
    created_at : Int;
  };

  public type BountyPostResponse = {
    message : Text;
    bounty_id : Nat;
  };

  public type BountyValue = {
    id : Nat;
    current_reward : Float;
  };

  // We use a simple Array to easily keep it stable or just transient
  transient var users : [(Username, UserData)] = [];
  transient var rngCounter : Nat = 0;
  transient var treasuryPartitions : [(Text, TreasuryPartition)] = [
    (
      "physical_commons",
      {
        name = "physical_commons";
        kind = "commons";
        allocated = 0;
        released = 0;
        memo = "Physical commons partition for shared civic resources";
      },
    ),
    (
      "treasury_release",
      {
        name = "treasury_release";
        kind = "treasury";
        allocated = 0;
        released = 0;
        memo = "Treasury release partition for staged distributions";
      },
    ),
  ];
  transient var treasuryReleases : [TreasuryRelease] = [];
  transient var releaseCounter : Nat = 0;
  transient var governanceCanisterId : Principal = Principal.fromText("aaaaa-aa");
  transient var telemetryOracleId : Principal = Principal.fromText("aaaaa-aa");
  transient var requiredStewardSignatures : Nat = 2;
  transient var activeStewards : [Principal] = [];
  transient var trancheRegistry : [MilestoneTranche] = [];
  transient var trancheCounter : Nat = 0;
  transient var telemetryMetrics : [(Text, Bool)] = [];
  transient var disputeCaseCounter : Nat = 0;
  transient var disputeCases : [(Nat, DisputeCase)] = [];
  transient var bounties : [Bounty] = [];
  transient var bountyCounter : Nat = 0;
  transient var ckbtcCanisterId : ?Principal = ?Principal.fromText("mqygn-kiaaa-aaaar-qaadq-cai");

  func resolveCkBtcCanisterId() : Principal {
    switch (ckbtcCanisterId) {
      case null { Principal.fromText("mqygn-kiaaa-aaaar-qaadq-cai") };
      case (?id) { id };
    }
  };

  func pseudoHex(n: Nat) : Text {
    let hexChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    var res = "";
    var current = n;
    var i = 0;
    while (i < 8) {
      let idx = current % 16;
      res := res # hexChars[idx];
      current := current / 16;
      i := i + 1;
    };
    return res;
  };

  func findUser(username: Username) : ?UserData {
    for ((u, d) in users.vals()) {
      if (u == username) {
        return ?d;
      };
    };
    return null;
  };

  func findTreasuryPartition(name : Text) : ?TreasuryPartition {
    for ((partitionName, partition) in treasuryPartitions.vals()) {
      if (partitionName == name) {
        return ?partition;
      };
    };
    return null;
  };

  func summarizePartition(partition : TreasuryPartition) : TreasuryPartitionSummary {
    let available = if (partition.allocated > partition.released) {
      partition.allocated - partition.released
    } else {
      0
    };
    {
      name = partition.name;
      kind = partition.kind;
      allocated = partition.allocated;
      released = partition.released;
      available = available;
      memo = partition.memo;
    }
  };

  func replacePartition(name : Text, updated : TreasuryPartition) {
    var next : [(Text, TreasuryPartition)] = [];
    for ((partitionName, partition) in treasuryPartitions.vals()) {
      if (partitionName == name) {
        next := Array.append(next, [(partitionName, updated)]);
      } else {
        next := Array.append(next, [(partitionName, partition)]);
      };
    };
    treasuryPartitions := next;
  };

  func principalInList(list : [Principal], target : Principal) : Bool {
    for (principal in list.vals()) {
      if (principal == target) {
        return true;
      };
    };
    return false;
  };

  func metricKey(steward : Principal, metric : Text) : Text {
    Principal.toText(steward) # "::" # metric
  };

  func getTelemetryMetric(steward : Principal, metric : Text) : Bool {
    let key = metricKey(steward, metric);
    for ((storedKey, isMet) in telemetryMetrics.vals()) {
      if (storedKey == key) {
        return isMet;
      };
    };
    false
  };

  func upsertTelemetryMetric(steward : Principal, metric : Text, isMet : Bool) {
    let key = metricKey(steward, metric);
    var found = false;
    var next : [(Text, Bool)] = [];
    for ((storedKey, storedValue) in telemetryMetrics.vals()) {
      if (storedKey == key) {
        found := true;
        next := Array.append(next, [(storedKey, isMet)]);
      } else {
        next := Array.append(next, [(storedKey, storedValue)]);
      };
    };
    if (not found) {
      next := Array.append(next, [(key, isMet)]);
    };
    telemetryMetrics := next;
  };

  func findTranche(id : Nat) : ?MilestoneTranche {
    for (tranche in trancheRegistry.vals()) {
      if (tranche.id == id) {
        return ?tranche;
      };
    };
    null
  };

  func replaceTranche(id : Nat, updated : MilestoneTranche) {
    var next : [MilestoneTranche] = [];
    for (tranche in trancheRegistry.vals()) {
      if (tranche.id == id) {
        next := Array.append(next, [updated]);
      } else {
        next := Array.append(next, [tranche]);
      };
    };
    trancheRegistry := next;
  };

  func hasSignature(tranche : MilestoneTranche, signer : Principal) : Bool {
    principalInList(tranche.signatures, signer)
  };

  func tierToJurorCount(tier : DisputeTier) : Nat {
    switch (tier) {
      case (#Five) { 5 };
      case (#Seven) { 7 };
      case (#Nine) { 9 };
    };
  };

  func isAssignedJuror(jurors : [Principal], target : Principal) : Bool {
    for (juror in jurors.vals()) {
      if (juror == target) {
        return true;
      };
    };
    false;
  };

  func findDisputeCase(caseId : Nat) : ?DisputeCase {
    for ((id, c) in disputeCases.vals()) {
      if (id == caseId) {
        return ?c;
      };
    };
    null;
  };

  func findBounty(bountyId : Nat) : ?Bounty {
    for (bounty in bounties.vals()) {
      if (bounty.id == bountyId) {
        return ?bounty;
      };
    };
    null;
  };

  func applyTreasuryRelease(partitionName : Text, amount : Nat, memo : Text) : TreasuryActionResponse {
    switch (findTreasuryPartition(partitionName)) {
      case null {
        {
          message = "Partition not found.";
          partition = partitionName;
          release = null;
          summary = null;
        };
      };
      case (?partition) {
        let available = if (partition.allocated > partition.released) {
          partition.allocated - partition.released
        } else {
          0
        };

        if (amount > available) {
          {
            message = "Insufficient available treasury balance.";
            partition = partitionName;
            release = null;
            summary = ?summarizePartition(partition);
          };
        } else {
          let updatedPartition : TreasuryPartition = {
            name = partition.name;
            kind = partition.kind;
            allocated = partition.allocated;
            released = partition.released + amount;
            memo = partition.memo;
          };
          replacePartition(partitionName, updatedPartition);

          releaseCounter := releaseCounter + 1;
          let release : TreasuryRelease = {
            id = releaseCounter;
            partition = partitionName;
            amount = amount;
            memo = memo;
            created_at = Time.now();
            status = "released";
          };
          treasuryReleases := Array.append(treasuryReleases, [release]);

          {
            message = "Treasury release recorded.";
            partition = partitionName;
            release = ?release;
            summary = ?summarizePartition(updatedPartition);
          };
        };
      };
    }
  };

  // --- AUTH & WALLET GENERATION ---
  public shared(msg) func login_or_register(username : Username) : async LoginResponse {
     let lowerUser = username; 
     switch(findUser(lowerUser)) {
        case null {
            rngCounter := rngCounter + 1;
            let mockTimeNum = Int.abs(Time.now() / 1000000000);
            let rawHex = pseudoHex(mockTimeNum + rngCounter * 999);
            let wallet = "0x40954b0d1fd" # rawHex # "a85de79b8faea2029766cd5";
            let salt = "secret_salt";
            let u : UserData = { merit = 10; salt = salt; wallet = wallet };
            users := Array.append(users, [(lowerUser, u)]);
            return {
              message = "New citizen registered and wallet generated.";
              username = lowerUser;
              wallet = wallet;
              merit = 10;
            };
        };
        case (?user) {
            return {
              message = "Welcome back, citizen.";
              username = lowerUser;
              wallet = user.wallet;
              merit = user.merit;
            };
        };
     };
  };

  // --- CHAT LOGIC ---
  public shared(msg) func chat(messages : [ChatMessage]) : async Text {
    return "This is a dummy chat response from the Native Motoko CivicOS backend.";
  };

  // --- BOUNTY LOGIC ---
  public shared(_msg) func createBounty(
    description : Text,
    base_reward : Float,
    urgency_coeff : Float,
  ) : async BountyPostResponse {
    bountyCounter := bountyCounter + 1;
    let newBounty : Bounty = {
      id = bountyCounter;
      description = description;
      base_reward = base_reward;
      urgency_coeff = urgency_coeff;
      created_at = Time.now();
    };
    bounties := Array.append(bounties, [newBounty]);
    {
      message = "Bounty posted to the grid";
      bounty_id = bountyCounter;
    }
  };

  public query func getBountyValue(bountyId : Nat) : async [BountyValue] {
    switch (findBounty(bountyId)) {
      case null {
        []
      };
      case (?bounty) {
        let now = Time.now();
        let elapsedNanos = if (now > bounty.created_at) {
          now - bounty.created_at
        } else {
          0
        };
        let elapsedSeconds = Float.fromInt(elapsedNanos) / 1_000_000_000.0;
        let currentReward = bounty.base_reward * (1.0 + (bounty.urgency_coeff * (elapsedSeconds / 60.0)));
        [
          {
            id = bounty.id;
            current_reward = currentReward;
          },
        ]
      };
    }
  };

  // --- MULTI-JUROR APPEALS ---
  public shared(_msg) func create_dispute(
    bountyId : Nat,
    claimant : Principal,
    tier : DisputeTier,
    selectedJurors : [Principal],
  ) : async Result.Result<Nat, Text> {
    let requiredJurors = tierToJurorCount(tier);
    if (selectedJurors.size() != requiredJurors) {
      return #err("Incorrect number of jurors for requested tier");
    };

    let newCaseId = disputeCaseCounter;
    disputeCaseCounter := disputeCaseCounter + 1;

    let newCase : DisputeCase = {
      id = newCaseId;
      bountyId = bountyId;
      claimant = claimant;
      tier = tier;
      status = #Voting;
      jurors = selectedJurors;
      votes = [];
      appealStake = 0;
    };

    disputeCases := Array.append(disputeCases, [(newCaseId, newCase)]);
    #ok(newCaseId)
  };

  public shared(msg) func submit_dispute_vote(
    caseId : Nat,
    vote : DisputeVote,
  ) : async Result.Result<(), Text> {
    let caller = msg.caller;

    switch (findDisputeCase(caseId)) {
      case null {
        #err("Case not found")
      };
      case (?c) {
        if (c.status != #Voting) {
          return #err("Case is not open for voting");
        };

        if (not isAssignedJuror(c.jurors, caller)) {
          return #err("Caller is not an assigned juror");
        };

        for ((juror, _) in c.votes.vals()) {
          if (juror == caller) {
            return #err("Juror has already voted");
          };
        };

        let updatedVotes = Array.append(c.votes, [(caller, vote)]);
        let nextStatus = if (updatedVotes.size() == tierToJurorCount(c.tier)) { #Resolved } else { #Voting };

        let updatedCase : DisputeCase = {
          id = c.id;
          bountyId = c.bountyId;
          claimant = c.claimant;
          tier = c.tier;
          status = nextStatus;
          jurors = c.jurors;
          votes = updatedVotes;
          appealStake = c.appealStake;
        };

        var nextCases : [(Nat, DisputeCase)] = [];
        for ((id, currentCase) in disputeCases.vals()) {
          if (id == caseId) {
            nextCases := Array.append(nextCases, [(id, updatedCase)]);
          } else {
            nextCases := Array.append(nextCases, [(id, currentCase)]);
          };
        };
        disputeCases := nextCases;
        #ok(())
      };
    }
  };

  public query func get_dispute_case(caseId : Nat) : async Result.Result<DisputeCase, Text> {
    switch (findDisputeCase(caseId)) {
      case null { #err("Case not found") };
      case (?c) { #ok(c) };
    }
  };

  public query func get_dispute_verdict(caseId : Nat) : async Result.Result<DisputeVote, Text> {
    switch (findDisputeCase(caseId)) {
      case null {
        #err("Case not found")
      };
      case (?c) {
        if (c.status != #Resolved) {
          return #err("Case is still open for voting");
        };

        var approveCount = 0;
        var rejectCount = 0;

        for ((_, vote) in c.votes.vals()) {
          switch (vote) {
            case (#Approve) { approveCount := approveCount + 1; };
            case (#Reject) { rejectCount := rejectCount + 1; };
          };
        };

        if (approveCount > rejectCount) {
          #ok(#Approve)
        } else {
          #ok(#Reject)
        }
      };
    }
  };

  public shared(_msg) func appeal_dispute(
    caseId : Nat,
    nextTier : DisputeTier,
    newJurors : [Principal],
    stakeAmount : Nat,
  ) : async Result.Result<Nat, Text> {
    let requiredJurors = tierToJurorCount(nextTier);
    if (newJurors.size() != requiredJurors) {
      return #err("Incorrect number of jurors for requested tier");
    };

    switch (findDisputeCase(caseId)) {
      case null {
        #err("Original case not found")
      };
      case (?c) {
        if (c.status != #Resolved) {
          return #err("Cannot appeal an unresolved case");
        };

        let newCaseId = disputeCaseCounter;
        disputeCaseCounter := disputeCaseCounter + 1;

        let escalatedCase : DisputeCase = {
          id = newCaseId;
          bountyId = c.bountyId;
          claimant = c.claimant;
          tier = nextTier;
          status = #Voting;
          jurors = newJurors;
          votes = [];
          appealStake = stakeAmount;
        };

        disputeCases := Array.append(disputeCases, [(newCaseId, escalatedCase)]);
        #ok(newCaseId)
      };
    }
  };

  // --- CKBTC CANISTER INTEGRATION ---
  // The app now defaults to the live ICP ckBTC minter on mainnet and can still be
  // reconfigured at runtime when a different minter or testnet deployment is required.
  public shared func configure_ckbtc_canister(canisterId : Principal) : async Text {
    ckbtcCanisterId := ?canisterId;
    "ckBTC canister configured: " # Principal.toText(canisterId)
  };

  public query func is_ckbtc_canister_configured() : async Bool {
    switch (ckbtcCanisterId) {
      case null { false };
      case (?_) { true };
    }
  };

  public shared(msg) func getBtcDepositAddress() : async Text {
    let canisterId = resolveCkBtcCanisterId();
    let ckbtcActor = actor (Principal.toText(canisterId)) : actor {
      get_btc_address : shared ({ owner : ?Principal; subaccount : ?Blob }) -> async Text;
    };
    await ckbtcActor.get_btc_address({ owner = ?msg.caller; subaccount = null });
  };

  public shared(msg) func check_for_deposits_and_mint_ckbtc() : async Text {
    let canisterId = resolveCkBtcCanisterId();
    let ckbtcActor = actor (Principal.toText(canisterId)) : actor {
      get_btc_address : shared ({ owner : ?Principal; subaccount : ?Blob }) -> async Text;
    };
    let address = await ckbtcActor.get_btc_address({ owner = ?msg.caller; subaccount = null });
    "Live ckBTC canister connected: " # Principal.toText(canisterId) # ". Deposit address: " # address # ". Minting remains gated by the upstream ckBTC flow."
  };

  // --- TREASURY & COMMONS PARTITIONING ---
  public shared func register_commons_partition(
    name : Text,
    kind : Text,
    allocated : Nat,
    memo : Text,
  ) : async TreasuryPartitionSummary {
    switch (findTreasuryPartition(name)) {
      case null {
        let partition : TreasuryPartition = {
          name = name;
          kind = kind;
          allocated = allocated;
          released = 0;
          memo = memo;
        };
        treasuryPartitions := Array.append(treasuryPartitions, [(name, partition)]);
        return summarizePartition(partition);
      };
      case (?partition) {
        return summarizePartition(partition);
      };
    };
  };

  public shared func release_treasury(
    partitionName : Text,
    amount : Nat,
    memo : Text,
  ) : async TreasuryActionResponse {
    applyTreasuryRelease(partitionName, amount, memo)
  };

  // --- STEWARD GOVERNANCE ---
  public shared(msg) func configure_steward_policy(
    governanceCanisterId_ : Principal,
    telemetryOracleId_ : Principal,
    requiredSignatures : Nat,
  ) : async StewardPolicySummary {
    if (msg.caller != governanceCanisterId) {
      return {
        governance_canister_id = governanceCanisterId;
        telemetry_oracle_id = telemetryOracleId;
        required_signatures = requiredStewardSignatures;
      };
    };
    governanceCanisterId := governanceCanisterId_;
    telemetryOracleId := telemetryOracleId_;
    requiredStewardSignatures := if (requiredSignatures == 0) 1 else requiredSignatures;
    {
      governance_canister_id = governanceCanisterId;
      telemetry_oracle_id = telemetryOracleId;
      required_signatures = requiredStewardSignatures;
    }
  };

  public shared(msg) func register_steward(steward : Principal) : async Text {
    if (msg.caller != governanceCanisterId) {
      return "Unauthorized: only governance can register stewards.";
    };
    if (principalInList(activeStewards, steward)) {
      return "Steward already active.";
    };
    activeStewards := Array.append(activeStewards, [steward]);
    "Steward registered."
  };

  public shared(msg) func unregister_steward(steward : Principal) : async Text {
    if (msg.caller != governanceCanisterId) {
      return "Unauthorized: only governance can unregister stewards.";
    };
    var next : [Principal] = [];
    for (p in activeStewards.vals()) {
      if (p != steward) {
        next := Array.append(next, [p]);
      };
    };
    activeStewards := next;
    "Steward unregistered."
  };

  public shared(msg) func create_tranche(
    recipient : Principal,
    partitionName : Text,
    amountE8s : Nat64,
    requiredTelemetryMetric : Text,
  ) : async MilestoneTranche {
    let caller = msg.caller;
    if (not principalInList(activeStewards, caller)) {
      return {
        id = 0;
        steward = caller;
        recipient = recipient;
        partition = partitionName;
        amount_e8s = amountE8s;
        required_telemetry_metric = requiredTelemetryMetric;
        signatures = [];
        status = #Revoked;
        created_at = Time.now();
      };
    };
    trancheCounter := trancheCounter + 1;
    let tranche : MilestoneTranche = {
      id = trancheCounter;
      steward = caller;
      recipient = recipient;
      partition = partitionName;
      amount_e8s = amountE8s;
      required_telemetry_metric = requiredTelemetryMetric;
      signatures = [caller];
      status = #Pending;
      created_at = Time.now();
    };
    trancheRegistry := Array.append(trancheRegistry, [tranche]);
    tranche
  };

  public shared(msg) func approve_tranche(trancheId : Nat) : async Text {
    let caller = msg.caller;
    if (not principalInList(activeStewards, caller)) {
      return "Unauthorized: caller is not an active steward.";
    };
    switch (findTranche(trancheId)) {
      case null { "Tranche ID not found." };
      case (?tranche) {
        if (tranche.status == #Executed or tranche.status == #Revoked) {
          return "Tranche cannot be approved in current state.";
        };
        if (hasSignature(tranche, caller)) {
          return "Steward already signed this tranche.";
        };
        let nextSigs = Array.append(tranche.signatures, [caller]);
        let nextStatus = if (nextSigs.size() >= requiredStewardSignatures) #Approved else #Pending;
        replaceTranche(
          tranche.id,
          {
            id = tranche.id;
            steward = tranche.steward;
            recipient = tranche.recipient;
            partition = tranche.partition;
            amount_e8s = tranche.amount_e8s;
            required_telemetry_metric = tranche.required_telemetry_metric;
            signatures = nextSigs;
            status = nextStatus;
            created_at = tranche.created_at;
          },
        );
        if (nextStatus == #Approved) {
          "Tranche approved and ready for execution."
        } else {
          "Signature recorded."
        }
      };
    }
  };

  public shared(msg) func revoke_tranche(trancheId : Nat) : async Text {
    let caller = msg.caller;
    if (not principalInList(activeStewards, caller) and caller != governanceCanisterId) {
      return "Unauthorized: caller cannot revoke tranche.";
    };
    switch (findTranche(trancheId)) {
      case null { "Tranche ID not found." };
      case (?tranche) {
        replaceTranche(
          tranche.id,
          {
            id = tranche.id;
            steward = tranche.steward;
            recipient = tranche.recipient;
            partition = tranche.partition;
            amount_e8s = tranche.amount_e8s;
            required_telemetry_metric = tranche.required_telemetry_metric;
            signatures = tranche.signatures;
            status = #Revoked;
            created_at = tranche.created_at;
          },
        );
        "Tranche revoked."
      };
    }
  };

  public shared(msg) func record_telemetry_metric(
    steward : Principal,
    metric : Text,
    isMet : Bool,
  ) : async Text {
    if (
      msg.caller != telemetryOracleId and
      msg.caller != governanceCanisterId and
      not principalInList(activeStewards, msg.caller)
    ) {
      return "Unauthorized: caller cannot submit telemetry.";
    };
    upsertTelemetryMetric(steward, metric, isMet);
    "Telemetry metric recorded."
  };

  public shared(msg) func execute_tranche_release(trancheId : Nat) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    if (not principalInList(activeStewards, caller)) {
      return #err("Unauthorized: caller is not an active steward.");
    };

    switch (findTranche(trancheId)) {
      case null { #err("Tranche ID not found.") };
      case (?tranche) {
        if (tranche.status != #Approved) {
          return #err("Tranche not in approved state.");
        };
        if (tranche.signatures.size() < requiredStewardSignatures) {
          return #err("Insufficient cryptographic multi-sig approvals.");
        };

        let isMetricMet = getTelemetryMetric(tranche.steward, tranche.required_telemetry_metric);
        if (not isMetricMet) {
          return #err("Telemetry oracle metric check failed.");
        };

        let treasuryResult = applyTreasuryRelease(
          tranche.partition,
          Nat64.toNat(tranche.amount_e8s),
          "steward tranche " # Nat64.toText(tranche.amount_e8s),
        );
        if (treasuryResult.release == null) {
          return #err("Treasury transfer failed: " # treasuryResult.message);
        };

        replaceTranche(
          tranche.id,
          {
            id = tranche.id;
            steward = tranche.steward;
            recipient = tranche.recipient;
            partition = tranche.partition;
            amount_e8s = tranche.amount_e8s;
            required_telemetry_metric = tranche.required_telemetry_metric;
            signatures = tranche.signatures;
            status = #Executed;
            created_at = tranche.created_at;
          },
        );
        #ok("Tranche released successfully via smart contract.")
      };
    }
  };

  public query func get_tranches() : async [MilestoneTranche] {
    trancheRegistry
  };

  public query func get_active_stewards() : async [Principal] {
    activeStewards
  };

  public query func get_steward_policy() : async StewardPolicySummary {
    {
      governance_canister_id = governanceCanisterId;
      telemetry_oracle_id = telemetryOracleId;
      required_signatures = requiredStewardSignatures;
    }
  };

  public query func get_commons_partitions() : async [TreasuryPartitionSummary] {
    var summaries : [TreasuryPartitionSummary] = [];
    for ((_, partition) in treasuryPartitions.vals()) {
      summaries := Array.append(summaries, [summarizePartition(partition)]);
    };
    return summaries;
  };

  public query func get_treasury_releases() : async [TreasuryRelease] {
    return treasuryReleases;
  };
}
