import React, { useState, useRef, useEffect } from 'react';
import { backend } from 'declarations/backend';
import botImg from '/bot.svg';
import userImg from '/user.svg';

const formatDate = (date) => {
  const h = '0' + date.getHours();
  const m = '0' + date.getMinutes();
  return `${h.slice(-2)}:${m.slice(-2)}`;
};

const AIChat = () => {
  const [chat, setChat] = useState([
    { system: { content: "I'm a sovereign AI agent living on the Internet Computer. Ask me anything about Civic-OS." } }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const askAgent = async (messages) => {
    try {
      const response = await backend.chat(messages);
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop();
        newChat.push({ system: { content: response } });
        return newChat;
      });
    } catch (e) {
      console.log(e);
      const eStr = String(e);
      const match = eStr.match(/(SysTransient|CanisterReject), \\+"([^\\"]+)/);
      if (match) {
        alert(match[2]);
      }
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop();
        return newChat;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { user: { content: inputValue } };
    const thinkingMessage = { system: { content: 'Thinking ...' } };
    setChat((prev) => [...prev, userMessage, thinkingMessage]);
    setInputValue('');
    setIsLoading(true);
    askAgent(chat.slice(1).concat(userMessage));
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">🤖</span> AI Civic Agent
      </h2>

      <div className="flex-1 overflow-y-auto rounded-lg bg-gray-50 p-4 mb-4 min-h-[240px] max-h-[360px]" ref={chatBoxRef}>
        {chat.map((message, index) => {
          const isUser = 'user' in message;
          const img = isUser ? userImg : botImg;
          const name = isUser ? 'You' : 'Civic Agent';
          const text = isUser ? message.user.content : message.system.content;
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
              {!isUser && (
                <div
                  className="mr-2 h-8 w-8 rounded-full flex-shrink-0"
                  style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
                />
              )}
              <div className={`max-w-[75%] rounded-lg p-3 ${isUser ? 'bg-blue-600 text-white' : 'bg-white shadow-sm'}`}>
                <div className={`mb-1 flex items-center justify-between text-xs ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                  <span>{name}</span>
                  <span className="ml-2">{formatDate(new Date())}</span>
                </div>
                <div className="text-sm">{text}</div>
              </div>
              {isUser && (
                <div
                  className="ml-2 h-8 w-8 rounded-full flex-shrink-0"
                  style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
                />
              )}
            </div>
          );
        })}
      </div>

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ask the Civic Agent anything…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </section>
  );
};

export default AIChat;
