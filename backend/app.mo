persistent actor {
  public func prompt(prompt : Text) : async Text {
    "This is a dummy response to: " # prompt;
  };

  public func chat(_messages : [Text]) : async Text {
    "This is a dummy chat response.";
  };
};
