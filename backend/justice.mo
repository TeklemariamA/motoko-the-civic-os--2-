import Time "mo:base/Time";
import Array "mo:base/Array";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Runtime "mo:base/Runtime";

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

    // ==========================================
    // --- ckBTC Integration Types & Logic ---
    // ==========================================

    public type Account = {
        owner : Principal;
        subaccount : ?Blob;
    };

    public type TransferArgs = {
        from_subaccount : ?Blob;
        to : Account;
        amount : Nat;
        fee : ?Nat;
        memo : ?Blob;
        created_at_time : ?Nat64;
    };

    public type TransferResult = {
        #Err : TransferError;
    };

    public type TransferError = {
        #BadFee : { expected_fee : Nat };
        #BadBurn : { min_burn_amount : Nat };
        #InsufficientFunds : { balance : Nat };
        #TooOld;
        #CreatedInFuture : { ledger_time : Nat64 };
        #Duplicate : { duplicate_of : Nat };
        #TemporarilyUnavailable;
        #GenericError : { error_code : Nat; message : Text };
    };

    public type UpdateBalanceResult = {
        #Ok : [UtxoStatus];
        #Err : UpdateBalanceError;
    };

    public type UtxoStatus = {
        #ValueTooSmall : Utxo;
        #Tainted : Utxo;
        #Checked : Utxo;
        #Minted : { block_index : Nat64; minted_amount : Nat64; utxo : Utxo };
    };

    public type Utxo = {
        outpoint : { txid : Blob; vout : Nat32 };
        value : Nat64;
        height : Nat32;
    };

    public type UpdateBalanceError = {
        #NoNewUtxos : {
            required_confirmations : Nat32;
            pending_utxos : ?[PendingUtxo];
            current_confirmations : ?Nat32;
        };
        #AlreadyProcessing;
        #TemporarilyUnavailable : Text;
        #GenericError : { error_code : Nat64; error_message : Text };
    };

    public type PendingUtxo = {
        outpoint : { txid : Blob; vout : Nat32 };
        value : Nat64;
        confirmations : Nat32;
    };

    public type ApproveArgs = {
        from_subaccount : ?Blob;
        spender : Account;
        amount : Nat;
        expected_allowance : ?Nat;
        expires_at : ?Nat64;
        fee : ?Nat;
        memo : ?Blob;
        created_at_time : ?Nat64;
    };

    public type ApproveError = {
        #BadFee : { expected_fee : Nat };
        #InsufficientFunds : { balance : Nat };
        #AllowanceChanged : { current_allowance : Nat };
        #Expired : { ledger_time : Nat64 };
        #TooOld;
        #CreatedInFuture : { ledger_time : Nat64 };
        #Duplicate : { duplicate_of : Nat };
        #TemporarilyUnavailable;
        #GenericError : { error_code : Nat; message : Text };
    };

    public type RetrieveBtcWithApprovalArgs = {
        address : Text;
        amount : Nat64;
        from_subaccount : ?Blob;
    };

    public type RetrieveBtcResult = {
        #Ok : { block_index : Nat64 };
        #Err : RetrieveBtcError;
    };

    public type RetrieveBtcError = {
        #MalformedAddress : Text;
        #AlreadyProcessing;
        #AmountTooLow : Nat64;
        #InsufficientFunds : { balance : Nat64 };
        #InsufficientAllowance : { allowance : Nat64 };
        #TemporarilyUnavailable : Text;
        #GenericError : { error_code : Nat64; error_message : Text };
    };

    // Remote canister references (Mainnet)
    transient let ckbtcLedger : actor {
        icrc1_transfer : shared (TransferArgs) -> async TransferResult;
        icrc1_balance_of : shared query (Account) -> async Nat;
        icrc1_fee : shared query () -> async Nat;
        icrc2_approve : shared (ApproveArgs) -> async { #Ok : Nat; #Err : ApproveError };
    } = actor "mxzaz-hqaaa-aaaar-qaada-cai";

    transient let ckbtcMinter : actor {
        get_btc_address : shared ({ owner : ?Principal; subaccount : ?Blob }) -> async Text;
        update_balance : shared ({ owner : ?Principal; subaccount : ?Blob }) -> async UpdateBalanceResult;
        retrieve_btc_with_approval : shared (RetrieveBtcWithApprovalArgs) -> async RetrieveBtcResult;
    } = actor "mqygn-kiaaa-aaaar-qaadq-cai";

    // Derive a 32-byte subaccount from a principal for per-user deposit addresses
    private func principalToSubaccount(p : Principal) : Blob {
        let bytes = Blob.toArray(Principal.toBlob(p));
        let size = bytes.size();
        let sub = Array.tabulate<Nat8>(32, func(i : Nat) : Nat8 {
            if (i == 0) { Nat8.fromNat(size) }
            else if (i <= size) { bytes[i - 1] }
            else { 0 }
        });
        Blob.fromArray(sub)
    };

    // -- Deposit: Get user's BTC deposit address --
    public shared ({ caller }) func getBtcDepositAddress() : async Text {
        if (Principal.isAnonymous(caller)) { Runtime.trap("Authentication required") };
        let subaccount = principalToSubaccount(caller);
        await ckbtcMinter.get_btc_address({
            owner = ?Principal.fromActor(OpenSourcistJustice);
            subaccount = ?subaccount;
        })
    };

    // -- Deposit: Check for new BTC and mint ckBTC --
    public shared ({ caller }) func checkBtcDeposit() : async UpdateBalanceResult {
        if (Principal.isAnonymous(caller)) { Runtime.trap("Authentication required") };
        let subaccount = principalToSubaccount(caller);
        await ckbtcMinter.update_balance({
            owner = ?Principal.fromActor(OpenSourcistJustice);
            subaccount = ?subaccount;
        })
    };

    // -- Withdraw: Convert ckBTC back to BTC --
    public shared ({ caller }) func withdrawBtc(btcAddress : Text, amount : Nat64) : async RetrieveBtcResult {
        if (Principal.isAnonymous(caller)) { Runtime.trap("Authentication required") };

        let fromSubaccount = principalToSubaccount(caller);
        let approveResult = await ckbtcLedger.icrc2_approve({
            from_subaccount = ?fromSubaccount;
            spender = {
                owner = Principal.fromText("mqygn-kiaaa-aaaar-qaadq-cai"); // Minter ID
                subaccount = null;
            };
            amount = Nat64.toNat(amount) + 10; // amount + fee for the minter's burn
            expected_allowance = null;
            expires_at = null;
            fee = ?10;
            memo = null;
            created_at_time = null;
        });

        switch (approveResult) {
            case (#Err(e)) { return #Err(#GenericError({ error_code = 0; error_message = "Approve for minter failed" })) };
            case (#Ok(_)) {};
        };

        await ckbtcMinter.retrieve_btc_with_approval({
            address = btcAddress;
            amount = amount;
            from_subaccount = ?fromSubaccount;
        })
    };
};
