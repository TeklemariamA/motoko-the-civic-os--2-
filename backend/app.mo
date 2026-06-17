import Text "mo:base/Text";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Array "mo:base/Array";

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

  // We use a simple Array to easily keep it stable or just transient
  transient var users : [(Username, UserData)] = [];
  transient var rngCounter : Nat = 0;

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
}
