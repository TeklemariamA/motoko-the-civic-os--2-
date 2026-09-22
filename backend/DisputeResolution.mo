import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

actor DisputeResolution {

    public type JuryTier = {
        #Five;
        #Seven;
        #Nine;
    };

    public type Vote = {
        #Approve;
        #Reject;
    };

    public type CaseStatus = {
        #Open;
        #Voting;
        #Resolved;
    };

    public type Case = {
        id : Nat;
        bountyId : Nat;
        claimant : Principal;
        tier : JuryTier;
        status : CaseStatus;
        jurors : [Principal];
        votes : [(Principal, Vote)];
        appealStake : Nat;
    };

    private var caseCounter : Nat = 0;
    private var cases : [(Nat, Case)] = [];

    private func tierToCount(tier : JuryTier) : Nat {
        switch (tier) {
            case (#Five) { 5 };
            case (#Seven) { 7 };
            case (#Nine) { 9 };
        };
    };

    private func isJuror(jurors : [Principal], target : Principal) : Bool {
        for (juror in jurors.vals()) {
            if (juror == target) {
                return true;
            };
        };
        false;
    };

    private func findCase(caseId : Nat) : ?Case {
        for ((id, c) in cases.vals()) {
            if (id == caseId) {
                return ?c;
            };
        };
        null;
    };

    public func createDispute(
        bountyId : Nat,
        claimant : Principal,
        tier : JuryTier,
        selectedJurors : [Principal],
    ) : async Result.Result<Nat, Text> {
        let requiredJurors = tierToCount(tier);
        if (selectedJurors.size() != requiredJurors) {
            return #err("Incorrect number of jurors for requested tier");
        };

        let newCaseId = caseCounter;
        caseCounter += 1;

        let newCase : Case = {
            id = newCaseId;
            bountyId = bountyId;
            claimant = claimant;
            tier = tier;
            status = #Voting;
            jurors = selectedJurors;
            votes = [];
            appealStake = 0;
        };

        cases := Array.append(cases, [(newCaseId, newCase)]);
        #ok(newCaseId)
    };

    public func submitVote(caseId : Nat, juror : Principal, vote : Vote) : async Result.Result<(), Text> {
        switch (findCase(caseId)) {
            case null {
                #err("Case not found")
            };
            case (?c) {
                if (c.status != #Voting) {
                    return #err("Case is not open for voting");
                };

                if (not isJuror(c.jurors, juror)) {
                    return #err("Caller is not an assigned juror");
                };

                for ((voter, _) in c.votes.vals()) {
                    if (voter == juror) {
                        return #err("Juror has already voted");
                    };
                };

                let updatedVotes = Array.append(c.votes, [(juror, vote)]);
                let updatedCase : Case = {
                    id = c.id;
                    bountyId = c.bountyId;
                    claimant = c.claimant;
                    tier = c.tier;
                    status = if (updatedVotes.size() == tierToCount(c.tier)) { #Resolved } else { #Voting };
                    jurors = c.jurors;
                    votes = updatedVotes;
                    appealStake = c.appealStake;
                };

                var updatedCases : [(Nat, Case)] = [];
                for ((id, currentCase) in cases.vals()) {
                    if (id == caseId) {
                        updatedCases := Array.append(updatedCases, [(id, updatedCase)]);
                    } else {
                        updatedCases := Array.append(updatedCases, [(id, currentCase)]);
                    };
                };
                cases := updatedCases;
                #ok(())
            };
        }
    };

    public func getVerdict(caseId : Nat) : async Result.Result<Vote, Text> {
        switch (findCase(caseId)) {
            case null {
                #err("Case not found")
            };
            case (?c) {
                if (c.status != #Resolved) {
                    return #err("Case is still open for voting");
                };

                var approveCount = 0;
                var rejectCount = 0;

                for ((_, v) in c.votes.vals()) {
                    switch (v) {
                        case (#Approve) { approveCount += 1; };
                        case (#Reject) { rejectCount += 1; };
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

    public func appealVerdict(
        caseId : Nat,
        nextTier : JuryTier,
        newJurors : [Principal],
        stakeAmount : Nat,
    ) : async Result.Result<Nat, Text> {
        let requiredJurors = tierToCount(nextTier);
        if (newJurors.size() != requiredJurors) {
            return #err("Incorrect number of jurors for requested tier");
        };

        switch (findCase(caseId)) {
            case null {
                #err("Original case not found")
            };
            case (?c) {
                if (c.status != #Resolved) {
                    return #err("Cannot appeal an unresolved case");
                };

                let newCaseId = caseCounter;
                caseCounter += 1;

                let escalatedCase : Case = {
                    id = newCaseId;
                    bountyId = c.bountyId;
                    claimant = c.claimant;
                    tier = nextTier;
                    status = #Voting;
                    jurors = newJurors;
                    votes = [];
                    appealStake = stakeAmount;
                };

                cases := Array.append(cases, [(newCaseId, escalatedCase)]);
                #ok(newCaseId)
            };
        }
    };
};
