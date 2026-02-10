export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'chat' : IDL.Func([IDL.Vec(IDL.Text)], [IDL.Text], []),
    'prompt' : IDL.Func([IDL.Text], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
