import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import botImg from '/bot.svg';
import userImg from '/user.svg';
import '/index.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loginInput, setLoginInput] = useState('');
  
  const [chat, setChat] = useState([
    {
      system: { content: "Welcome to CivicOS v2.0: The Purist Protocol. Ask me anything." }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);
  
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginInput.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username: loginInput })
      });
      const data = await response.json();
      setUser(data);
      alert(data.message);
    } catch (e) {
      console.log(e);
      alert("Error logging in.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
  };

  const askAgent = async (messages) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(messages)
      });
      const data = await response.json();
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop();
        newChat.push({ system: { content: data.response } });
        return newChat;
      });
    } catch (e) {
      console.log(e);
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

    const userMessage = {
      user: { content: inputValue }
    };
    const thinkingMessage = {
      system: { content: 'Thinking ...' }
    };
    setChat((prevChat) => [...prevChat, userMessage, thinkingMessage]);
    setInputValue('');
    setIsLoading(true);

    const messagesToSend = chat.slice(1).concat(userMessage);
    askAgent(messagesToSend);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <form className="flex w-full max-w-sm flex-col rounded-lg bg-white shadow-lg p-6" onSubmit={handleLogin}>
          <h2 className="text-2xl font-bold mb-4 text-center">Citizen Access</h2>
          <p className="text-sm text-gray-500 mb-6 text-center">Enter your username to access your wallet or generate a new one.</p>
          <input
            type="text"
            className="rounded border p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Username"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect to Grid'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-lg">
        {/* Header with Wallet and Install Button */}
        <div className="flex items-center justify-between border-b p-4 bg-gray-100 rounded-t-lg">
          <div>
            <div className="font-bold text-gray-800">Citizen: {user.username}</div>
            <div className="text-xs text-gray-500 font-mono" title="Wallet Address">{user.wallet}</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-semibold text-blue-600">Merit: {user.merit}</div>
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="text-xs rounded bg-blue-50 p-2 text-blue-600 border border-blue-200 hover:bg-blue-100 shadow-sm"
              >
                Install App
              </button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4" ref={chatBoxRef}>
          {chat.map((message, index) => {
            const isUser = 'user' in message;
            const img = isUser ? userImg : botImg;
            const name = isUser ? 'User' : 'System';
            const text = isUser ? message.user.content : message.system.content;

            return (
              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                {!isUser && (
                  <div
                    className="mr-2 h-10 w-10 min-w-10 rounded-full"
                    style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
                  ></div>
                )}
                <div className={`max-w-[70%] rounded-lg p-3 ${isUser ? 'bg-blue-500 text-white' : 'bg-white shadow'}`}>
                  <div
                    className={`mb-1 flex items-center justify-between text-sm ${isUser ? 'text-white' : 'text-gray-500'}`}
                  >
                    <div>{name}</div>
                    <div className="mx-2">{formatDate(new Date())}</div>
                  </div>
                  <div>{text}</div>
                </div>
                {isUser && (
                  <div
                    className="ml-2 h-10 w-10 min-w-10 rounded-full"
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
            className="flex-1 rounded-l border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            placeholder="Ask anything ..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="rounded-r bg-blue-500 p-2 px-4 text-white hover:bg-blue-600 disabled:bg-blue-300 shadow-sm font-semibold"
            disabled={isLoading}
          >
            Send
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
