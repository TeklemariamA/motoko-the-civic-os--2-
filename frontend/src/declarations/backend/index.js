// Local stub for `declarations/backend` used when `dfx generate` isn't run.
// This provides a minimal `backend.chat` implementation for local builds and static deploys.
export const backend = {
  chat: async (messages) => {
    // simple echo-style stub
    const last = messages && messages.length ? messages[messages.length - 1] : { user: { content: '' } };
    const content = last.user ? `Echo: ${last.user.content}` : "Hello from local stub.";
    return Promise.resolve(content);
  }
};
