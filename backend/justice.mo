import Time "mo:base/Time";
import Array "mo:base/Array";
import List "mo:base/List";
import Principal "mo:base/Principal";

actor OpenSourcistJustice {

    public type CaseStatus = {
        #Open;
        #Tier1Resolved;
        #Tier2Resolved;
        #Finalized;
    };

    public type JuryTier = {
        #Tier1; // 5 Jurors
        #Tier2; // 7 Jurors
        #Tier3; // 9 Jurors
    };

    public type JusticeCase = {
        id: Nat;
        plaintiff: Principal;
        defendant: Principal;
        description: Text;
        status: CaseStatus;
        tier: JuryTier;
        timestamp: Int;
        verdictHash: ?Text;
    };

    stable var nextCaseId : Nat = 0;
    stable var cases = List.nil<JusticeCase>();

    // --- Core Functions ---

    // 1. File a new case (Initiates Tier 1)
    public shared ({caller}) func fileCase(defendant: Principal, desc: Text) : async Nat {
        let newCase : JusticeCase = {
            id = nextCaseId;
            plaintiff = caller;
            defendant = defendant;
            description = desc;
            status = #Open;
            tier = #Tier1;
            timestamp = Time.now();
            verdictHash = null;
        };
        cases := List.push(newCase, cases);
        nextCaseId += 1;
        return newCase.id;
    };

    // 2. Appeal Mechanism (The 5-7-9 Logic)
    public shared ({caller}) func initiateAppeal(caseId: Nat) : async Text {
        // Logic to find case and verify two-month window
        let currentCase = findCase(caseId); 
        let now = Time.now();
        let twoMonthsInNanoseconds : Int = 5184000000000000;

        if (now > currentCase.timestamp + twoMonthsInNanoseconds) {
            return "Error: Appeal window closed (2-month limit exceeded).";
        };

        switch (currentCase.tier) {
            case (#Tier1) {
                updateCaseTier(caseId, #Tier2);
                return "Appeal Accepted: Moving to Tier 2 (7 Jurors).";
            };
            case (#Tier2) {
                updateCaseTier(caseId, #Tier3);
                return "Final Re-appeal Accepted: Moving to Tier 3 (9 Jurors).";
            };
            case (#Tier3) {
                return "Error: Tier 3 is the Supreme Commons. No further appeals possible.";
            };
        };
    };

    // --- Helper Logic ---
    private func updateCaseTier(caseId: Nat, newTier: JuryTier) {
        // Implementation to update the stable list with the new Jury size
    };

    private func findCase(id: Nat) : JusticeCase {
        // Implementation to retrieve case by ID
        // Placeholder return to satisfy type checking
        return {
            id = 0;
            plaintiff = Principal.fromActor(OpenSourcistJustice);
            defendant = Principal.fromActor(OpenSourcistJustice);
            description = "";
            status = #Open;
            tier = #Tier1;
            timestamp = 0;
            verdictHash = null;
        };
    };
};
