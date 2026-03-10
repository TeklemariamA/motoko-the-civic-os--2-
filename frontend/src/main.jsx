import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { backend } from 'declarations/backend';
import botImg from '/bot.svg';
import userImg from '/user.svg';
import '/index.css';

// ---- Chat Tab ----
const ChatTab = () => {
  const [chat, setChat] = useState([
    { system: { content: "I'm a sovereign AI agent living on the Internet Computer. Ask me anything." } }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const formatDate = (date) => {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
  };

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
      if (match) alert(match[2]);
      setChat((prevChat) => { const updatedChat = [...prevChat]; updatedChat.pop(); return updatedChat; });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const userMessage = { user: { content: inputValue } };
    setChat((prev) => [...prev, userMessage, { system: { content: 'Thinking ...' } }]);
    setInputValue('');
    setIsLoading(true);
    askAgent(chat.slice(1).concat(userMessage));
  };

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [chat]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4" ref={chatBoxRef}>
        {chat.map((message, index) => {
          const isUser = 'user' in message;
          const img = isUser ? userImg : botImg;
          const name = isUser ? 'User' : 'System';
          const text = isUser ? message.user.content : message.system.content;
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
              {!isUser && <div className="mr-2 h-10 w-10 rounded-full" style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }} />}
              <div className={`max-w-[70%] rounded-lg p-3 ${isUser ? 'bg-blue-500 text-white' : 'bg-white shadow'}`}>
                <div className={`mb-1 flex items-center justify-between text-sm ${isUser ? 'text-white' : 'text-gray-500'}`}>
                  <div>{name}</div>
                  <div className="mx-2">{formatDate(new Date())}</div>
                </div>
                <div>{text}</div>
              </div>
              {isUser && <div className="ml-2 h-10 w-10 rounded-full" style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }} />}
            </div>
          );
        })}
      </div>
      <form className="flex border-t bg-white p-4" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-1 rounded-l border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask anything ..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="rounded-r bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-blue-300" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

// ---- Bounties Tab ----
const BountiesTab = () => {
  const [description, setDescription] = useState('');
  const [baseReward, setBaseReward] = useState('');
  const [urgency, setUrgency] = useState('0.05');
  const [queryId, setQueryId] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('Creating bounty…');
    try {
      const res = await backend.createBounty(description, parseFloat(baseReward), parseFloat(urgency));
      setStatus(`✅ ${res.message} (ID: ${res.bounty_id})`);
      setDescription(''); setBaseReward(''); setUrgency('0.05');
    } catch (err) {
      setStatus(`❌ Error: ${String(err)}`);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    setResult(null);
    try {
      const res = await backend.getBountyValue(BigInt(queryId));
      if (res.length === 0) { setResult('Bounty not found.'); return; }
      const { id, current_reward } = res[0];
      setResult(`Bounty #${id} — current reward: ${current_reward.toFixed(2)}`);
    } catch (err) {
      setResult(`❌ Error: ${String(err)}`);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-semibold text-gray-700">Post a Bounty</h2>
      <form onSubmit={handleCreate} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input className="w-full rounded border p-2" type="number" placeholder="Base reward (e.g. 100)" value={baseReward} onChange={(e) => setBaseReward(e.target.value)} required />
        <input className="w-full rounded border p-2" type="number" step="0.01" placeholder="Urgency coefficient (default 0.05)" value={urgency} onChange={(e) => setUrgency(e.target.value)} />
        <button type="submit" className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Post Bounty</button>
      </form>
      {status && <p className="text-sm text-gray-600">{status}</p>}

      <hr />
      <h2 className="text-lg font-semibold text-gray-700">Check Current Value</h2>
      <form onSubmit={handleQuery} className="flex gap-2">
        <input className="flex-1 rounded border p-2" type="number" placeholder="Bounty ID" value={queryId} onChange={(e) => setQueryId(e.target.value)} required />
        <button type="submit" className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">Check</button>
      </form>
      {result && <p className="text-sm text-gray-600">{result}</p>}
    </div>
  );
};

// ---- Audit Tab ----
const AuditTab = () => {
  const [proofHash, setProofHash] = useState('');
  const [actionType, setActionType] = useState('');
  const [log, setLog] = useState([]);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('Submitting…');
    try {
      const res = await backend.privateAction(proofHash, actionType);
      setSubmitStatus(`✅ ${res.message}`);
      setProofHash(''); setActionType('');
    } catch (err) {
      setSubmitStatus(`❌ Error: ${String(err)}`);
    }
  };

  const handleFetchLog = async () => {
    try {
      const entries = await backend.publicLog();
      setLog(entries);
    } catch (err) {
      setLog([]);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-semibold text-gray-700">Submit Private Action (ZK-Proof)</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Proof hash (sha256 of your action)" value={proofHash} onChange={(e) => setProofHash(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Action type (e.g. vote, spend)" value={actionType} onChange={(e) => setActionType(e.target.value)} required />
        <button type="submit" className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Submit</button>
      </form>
      {submitStatus && <p className="text-sm text-gray-600">{submitStatus}</p>}

      <hr />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Public Audit Log</h2>
        <button onClick={handleFetchLog} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">Refresh</button>
      </div>
      {log.length === 0
        ? <p className="text-sm text-gray-500">No entries yet.</p>
        : <ul className="space-y-2 text-sm">
            {log.map((entry, i) => (
              <li key={i} className="rounded bg-gray-50 p-2">
                <span className="font-mono text-xs text-gray-400">{entry.proof_signature}</span>
                {' — '}<strong>{entry.action}</strong>
                {' — '}<span className="text-gray-500">{new Date(Number(entry.timestamp / 1_000_000n)).toLocaleString()}</span>
              </li>
            ))}
          </ul>
      }
    </div>
  );
};

// ---- Justice Tab ----
const JusticeTab = () => {
  const [plaintiff, setPlaintiff] = useState('');
  const [defendant, setDefendant] = useState('');
  const [category, setCategory] = useState('');
  const [evidence, setEvidence] = useState('');
  const [caseResult, setCaseResult] = useState(null);

  const [caseId, setCaseId] = useState('');
  const [jurorName, setJurorName] = useState('');
  const [verdict, setVerdict] = useState('');
  const [verdictResult, setVerdictResult] = useState(null);

  const handleFileCase = async (e) => {
    e.preventDefault();
    setCaseResult('Filing case…');
    try {
      const res = await backend.fileCase(plaintiff, defendant, category, evidence);
      setCaseResult(`✅ Case #${res.case_id} filed. Jurors: ${res.jury.join(', ')}`);
      setPlaintiff(''); setDefendant(''); setCategory(''); setEvidence('');
    } catch (err) {
      setCaseResult(`❌ Error: ${String(err)}`);
    }
  };

  const handleCastVerdict = async (e) => {
    e.preventDefault();
    setVerdictResult('Casting verdict…');
    try {
      const res = await backend.castVerdict(BigInt(caseId), jurorName, verdict);
      if (res.length === 0) { setVerdictResult('❌ Unauthorized juror or case not found.'); return; }
      setVerdictResult(`✅ ${res[0].message} — verdict: ${res[0].verdict}`);
      setCaseId(''); setJurorName(''); setVerdict('');
    } catch (err) {
      setVerdictResult(`❌ Error: ${String(err)}`);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-semibold text-gray-700">File a Case</h2>
      <form onSubmit={handleFileCase} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Plaintiff" value={plaintiff} onChange={(e) => setPlaintiff(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Defendant" value={defendant} onChange={(e) => setDefendant(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Category (e.g. Energy, Contract)" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <textarea className="w-full rounded border p-2" placeholder="Evidence (hashed on-chain)" value={evidence} onChange={(e) => setEvidence(e.target.value)} required />
        <button type="submit" className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">File Case</button>
      </form>
      {caseResult && <p className="text-sm text-gray-600">{caseResult}</p>}

      <hr />
      <h2 className="text-lg font-semibold text-gray-700">Cast Verdict</h2>
      <form onSubmit={handleCastVerdict} className="space-y-3">
        <input className="w-full rounded border p-2" type="number" placeholder="Case ID" value={caseId} onChange={(e) => setCaseId(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Juror name" value={jurorName} onChange={(e) => setJurorName(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Verdict (e.g. guilty, not-guilty)" value={verdict} onChange={(e) => setVerdict(e.target.value)} required />
        <button type="submit" className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600">Cast Verdict</button>
      </form>
      {verdictResult && <p className="text-sm text-gray-600">{verdictResult}</p>}
    </div>
  );
};

// ---- Legislature Tab ----
const LegislatureTab = () => {
  // Propose
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [proposeStatus, setProposeStatus] = useState('');

  // Vote
  const [voteId, setVoteId] = useState('');
  const [voteCitizen, setVoteCitizen] = useState('');
  const [voteChoice, setVoteChoice] = useState('yes');
  const [voteResult, setVoteResult] = useState(null);

  // Fork
  const [forkId, setForkId] = useState('');
  const [forkTitle, setForkTitle] = useState('');
  const [forkBody, setForkBody] = useState('');
  const [forkAuthor, setForkAuthor] = useState('');
  const [forkResult, setForkResult] = useState(null);

  // Bill list
  const [bills, setBills] = useState([]);

  const handlePropose = async (e) => {
    e.preventDefault();
    setProposeStatus('Proposing…');
    try {
      const res = await backend.proposeBill(title, body, author, category);
      setProposeStatus(`✅ ${res.message} (Bill #${res.bill_id})`);
      setTitle(''); setBody(''); setAuthor(''); setCategory('');
    } catch (err) {
      setProposeStatus(`❌ Error: ${String(err)}`);
    }
  };

  const handleVote = async (e) => {
    e.preventDefault();
    setVoteResult('Voting…');
    try {
      const res = await backend.castVote(BigInt(voteId), voteCitizen, voteChoice);
      if (res.length === 0) { setVoteResult('❌ Bill not found or already voted.'); return; }
      const r = res[0];
      const pct = (Number(r.yes) + Number(r.no)) > 0
        ? Math.round(Number(r.yes) / (Number(r.yes) + Number(r.no)) * 100)
        : 0;
      setVoteResult(`✅ ${r.message} — 👍 ${r.yes} / 👎 ${r.no} / 🤝 ${r.abstain} (${pct}% yes) — ${r.status.toUpperCase()}`);
      setVoteId(''); setVoteCitizen(''); setVoteChoice('yes');
    } catch (err) {
      setVoteResult(`❌ Error: ${String(err)}`);
    }
  };

  const handleFork = async (e) => {
    e.preventDefault();
    setForkResult('Forking…');
    try {
      const res = await backend.forkBill(BigInt(forkId), forkTitle, forkBody, forkAuthor);
      if (res.length === 0) { setForkResult('❌ Original bill not found.'); return; }
      setForkResult(`✅ ${res[0].message} → new Bill #${res[0].bill_id}`);
      setForkId(''); setForkTitle(''); setForkBody(''); setForkAuthor('');
    } catch (err) {
      setForkResult(`❌ Error: ${String(err)}`);
    }
  };

  const fetchBills = async () => {
    try { setBills(await backend.listBills()); }
    catch { setBills([]); }
  };

  const statusClass = (s) => {
    if (s === 'passed') return 'text-green-600 font-bold';
    if (s === 'rejected') return 'text-red-600 font-bold';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6 p-4">
      {/* Propose */}
      <h2 className="text-lg font-semibold text-gray-700">📜 Propose a Bill</h2>
      <form onSubmit={handlePropose} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Bill title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="w-full rounded border p-2" rows={3} placeholder="Bill body / description" value={body} onChange={(e) => setBody(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Category (e.g. Energy, Housing)" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Propose Bill</button>
      </form>
      {proposeStatus && <p className="text-sm text-gray-600">{proposeStatus}</p>}

      <hr />

      {/* Vote */}
      <h2 className="text-lg font-semibold text-gray-700">🗳️ Cast Vote <span className="text-sm font-normal text-gray-500">(50+1 rule)</span></h2>
      <p className="text-xs text-gray-400">A bill commits to the Social Ledger once Yes votes exceed 50% of all participating votes.</p>
      <form onSubmit={handleVote} className="space-y-3">
        <input className="w-full rounded border p-2" type="number" placeholder="Bill ID" value={voteId} onChange={(e) => setVoteId(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Citizen name" value={voteCitizen} onChange={(e) => setVoteCitizen(e.target.value)} required />
        <select className="w-full rounded border p-2" value={voteChoice} onChange={(e) => setVoteChoice(e.target.value)}>
          <option value="yes">👍 Yes</option>
          <option value="no">👎 No</option>
          <option value="abstain">🤝 Abstain</option>
        </select>
        <button type="submit" className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">Cast Vote</button>
      </form>
      {voteResult && <p className="text-sm text-gray-600">{voteResult}</p>}

      <hr />

      {/* Fork */}
      <h2 className="text-lg font-semibold text-gray-700">🍴 Fork a Bill</h2>
      <p className="text-xs text-gray-400">Create an amended variant of an existing bill. The fork starts fresh with 0 votes.</p>
      <form onSubmit={handleFork} className="space-y-3">
        <input className="w-full rounded border p-2" type="number" placeholder="Original Bill ID" value={forkId} onChange={(e) => setForkId(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="New title" value={forkTitle} onChange={(e) => setForkTitle(e.target.value)} required />
        <textarea className="w-full rounded border p-2" rows={2} placeholder="Amended body" value={forkBody} onChange={(e) => setForkBody(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Fork author" value={forkAuthor} onChange={(e) => setForkAuthor(e.target.value)} required />
        <button type="submit" className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600">Fork Bill</button>
      </form>
      {forkResult && <p className="text-sm text-gray-600">{forkResult}</p>}

      <hr />

      {/* Bill list */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">📋 All Bills</h2>
        <button onClick={fetchBills} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">Refresh</button>
      </div>
      {bills.length === 0
        ? <p className="text-sm text-gray-500">No bills yet — click Refresh to load.</p>
        : <ul className="space-y-3">
            {bills.map((bill) => {
              const yes = Number(bill.yes_votes);
              const no  = Number(bill.no_votes);
              const abs = Number(bill.abstain_votes);
              const total = yes + no;
              const pct = total > 0 ? Math.round(yes / total * 100) : 0;
              return (
                <li key={Number(bill.id)} className="rounded border p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs text-gray-400">#{Number(bill.id)}</span>
                      {bill.forked_from.length > 0 && (
                        <span className="ml-2 rounded bg-yellow-100 px-1 text-xs text-yellow-700">
                          🍴 fork of #{Number(bill.forked_from[0])}
                        </span>
                      )}
                      <p className="font-semibold">{bill.title}</p>
                      <p className="text-xs text-gray-500">{bill.author} · {bill.category}</p>
                    </div>
                    <span className={`whitespace-nowrap text-xs ${statusClass(bill.status)}`}>
                      {bill.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-700">{bill.body}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    👍 {yes} · 👎 {no} · 🤝 {abs}
                    {total > 0 && <span className="ml-2 font-medium">{pct}% yes {yes * 2 > total ? '✅' : ''}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
      }
    </div>
  );
};

// ---- Root App ----
const TABS = ['Chat', 'Bounties', 'Audit', 'Justice', 'Legislature'];

const App = () => {
  const [activeTab, setActiveTab] = useState('Chat');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-lg">
        {/* Tab bar */}
        <div className="flex border-b">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'Chat'        && <ChatTab />}
          {activeTab === 'Bounties'    && <BountiesTab />}
          {activeTab === 'Audit'       && <AuditTab />}
          {activeTab === 'Justice'     && <JusticeTab />}
          {activeTab === 'Legislature' && <LegislatureTab />}
        </div>
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
