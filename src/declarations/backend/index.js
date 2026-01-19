// Local stub placed at repository `src/declarations/backend` to satisfy Vite alias.
export const backend = {
  chat: async (messages) => {
    const last = messages && messages.length ? messages[messages.length - 1] : { user: { content: '' } };
    const content = last.user ? `Echo: ${last.user.content}` : "Hello from local stub.";
    return Promise.resolve(content);
  }
};
