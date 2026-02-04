import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { backend } from 'declarations/backend';
import botImg from '/bot.svg';
import userImg from '/user.svg';
import '/index.css';

const STORAGE_KEY = 'civic_chat_history_v1';

const App = () => {
  const [chat, setChat] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read chat from localStorage', e);
    }
    return [
      {
        system: { content: "I'm a sovereign AI agent living on the Internet Computer. Ask me anything." },
        ts: new Date().toISOString()
      }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const formatDate = (date) => {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
  };

  const persist = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // ignore storage errors
    }
  };

  const askAgent = async (messages) => {
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      const data = await response.json();
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop();
        newChat.push({ system: { content: data.response || data }, ts: new Date().toISOString() });
        persist(newChat);
        return newChat;
      });
    } catch (e) {
      console.log(e);
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop();
        newChat.push({ system: { content: 'Error: ' + String(e) }, ts: new Date().toISOString() });
        persist(newChat);
        return newChat;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      user: { content: inputValue },
      ts: new Date().toISOString()
    };
    const thinkingMessage = {
      system: { content: 'Thinking ...' },
      ts: new Date().toISOString()
    };
    setChat((prevChat) => {
      const next = [...prevChat, userMessage, thinkingMessage];
      persist(next);
      return next;
    });
    setInputValue('');
    setIsLoading(true);

    const messagesToSend = chat.slice(1).concat(userMessage);
    askAgent(messagesToSend);
  };

  const clearChat = () => {
    const base = [
      {
        system: { content: "I'm a sovereign AI agent living on the Internet Computer. Ask me anything." },
        ts: new Date().toISOString()
      }
    ];
    setChat(base);
    persist(base);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between gap-2 rounded-t-lg border-b bg-white p-3">
          <div className="text-lg font-semibold">Civic LLM</div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto rounded-b-lg bg-gray-100 p-4" ref={chatBoxRef}>
          {chat.map((message, index) => {
            const isUser = 'user' in message;
            const img = isUser ? userImg : botImg;
            const name = isUser ? 'User' : 'System';
            const text = isUser ? message.user.content : message.system.content;
            const ts = message.ts ? new Date(message.ts) : new Date();

            return (
              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                {!isUser && (
                  <div
                    className="mr-2 h-10 w-10 rounded-full"
                    style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
                  ></div>
                )}
                <div className={`max-w-[70%] rounded-lg p-3 ${isUser ? 'bg-blue-500 text-white' : 'bg-white shadow'}`}>
                  <div
                    className={`mb-1 flex items-center justify-between text-sm ${isUser ? 'text-white' : 'text-gray-500'}`}
                  >
                    <div>{name}</div>
                    <div className="mx-2">{formatDate(ts)}</div>
                  </div>
                  <div>{text}</div>
                </div>
                {isUser && (
                  <div
                    className="ml-2 h-10 w-10 rounded-full"
                    style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
        <form className="flex rounded-b-lg border-t bg-white p-4" onSubmit={handleSubmit}>
          <input
            type="text"
            className="flex-1 rounded-l border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask anything ..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="rounded-r bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
