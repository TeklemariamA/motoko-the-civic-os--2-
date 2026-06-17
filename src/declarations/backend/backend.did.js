export const idlFactory = ({ IDL }) => {
  const ChatMessage = IDL.Record({ 'content' : IDL.Text, 'role' : IDL.Text });
  const Username = IDL.Text;
  const LoginResponse = IDL.Record({
    'merit' : IDL.Nat,
    'username' : IDL.Text,
    'message' : IDL.Text,
    'wallet' : IDL.Text,
  });
  return IDL.Service({
    'chat' : IDL.Func([IDL.Vec(ChatMessage)], [IDL.Text], []),
    'login_or_register' : IDL.Func([Username], [LoginResponse], []),
  });
};
export const init = ({ IDL }) => { return []; };
