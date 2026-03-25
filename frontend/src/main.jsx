import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { backend } from './declarations/backend/index.js';
import botImg from '/bot.svg';
import userImg from '/user.svg';
import '/index.css';

const runtimeConfig = globalThis?.CIVIC_OS_CONFIG || {};
const processEnv = typeof process !== 'undefined' ? process.env : {};

const parseBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  }
  return fallback;
};

const CHATBOT_ENABLED = parseBoolean(runtimeConfig.ENABLE_CHATBOT, false);
const CHAT_ENDPOINT = runtimeConfig.CHAT_ENDPOINT
  || processEnv.CHAT_ENDPOINT
  || import.meta.env.CHAT_ENDPOINT
  || 'https://civic-os-opensourcism.cloud/chat';

const buildShareUrls = (title, text) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(baseUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);

  return {
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  };
};

const ShareBar = ({ title, text }) => {
  const share = buildShareUrls(title, text);
  return (
    <div className="mt-6 border-t pt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500" aria-label="Share links">
      <span>Share:</span>
      <a className="rounded bg-black px-3 py-1.5 text-white" href={share.x} target="_blank" rel="noopener noreferrer">X</a>
      <a className="rounded bg-blue-700 px-3 py-1.5 text-white" href={share.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a className="rounded bg-blue-600 px-3 py-1.5 text-white" href={share.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
      <a className="rounded bg-green-600 px-3 py-1.5 text-white" href={share.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a className="rounded bg-blue-500 px-3 py-1.5 text-white" href={share.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
    </div>
  );
};

// ---- Chat Tab ----
const ChatTab = () => {
  const [chat, setChat] = useState([
    { system_: { content: "I'm a sovereign AI agent living on the Internet Computer. Ask me anything." } }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHealth, setChatHealth] = useState('unknown'); // unknown | ok | down
  const [chatHealthMsg, setChatHealthMsg] = useState('');
  const chatBoxRef = useRef(null);

  const formatDate = (date) => {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
  };

  const askAgent = async (messages) => {
    try {
      const payload = {
        messages: messages.map((m) => {
          if ('user' in m) return { role: 'user', content: m.user.content };
          return { role: 'system', content: m.system_?.content ?? m.system?.content ?? '' };
        })
      };

      const resp = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let replyText = '';
      const contentType = resp.headers.get('content-type') || '';
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || `Chat service error (${resp.status})`);
      }

      if (contentType.includes('application/json')) {
        const data = await resp.json();
        if (typeof data === 'string') replyText = data;
        else if (typeof data.reply === 'string') replyText = data.reply;
        else if (typeof data.message === 'string') replyText = data.message;
        else if (typeof data.content === 'string') replyText = data.content;
        else replyText = JSON.stringify(data);
      } else {
        replyText = await resp.text();
      }

      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop();
        newChat.push({ system_: { content: replyText } });
        return newChat;
      });
    } catch (e) {
      console.log(e);
      const eStr = String(e);
      const match = eStr.match(/(SysTransient|CanisterReject), \+"([^\"]+)/);
      if (match) alert(match[2]);
      setChat((prevChat) => { const updatedChat = [...prevChat]; updatedChat.pop(); return updatedChat; });
    } finally {
      setIsLoading(false);
    }
  };

  const checkChatHealth = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const resp = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'ping' }] }),
        signal: controller.signal
      });
      const ok = resp.ok;
      const txt = await resp.text();
      setChatHealth(ok ? 'ok' : 'down');
      setChatHealthMsg(ok ? 'Chat is reachable' : `Chat error ${resp.status}: ${txt?.slice(0, 120)}`);
    } catch (err) {
      setChatHealth('down');
      setChatHealthMsg(String(err));
    } finally {
      clearTimeout(timeout);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const userMessage = { user: { content: inputValue } };
    setChat((prev) => [...prev, userMessage, { system_: { content: 'Thinking ...' } }]);
    setInputValue('');
    setIsLoading(true);
    askAgent(chat.slice(1).concat(userMessage));
  };

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [chat]);

  useEffect(() => {
    checkChatHealth();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-white p-4">
        <h2 className="text-lg font-semibold text-gray-700">🤖 Civic OS Agent</h2>
      </div>
      {chatHealth !== 'ok' && (
        <div className="bg-yellow-100 text-yellow-800 px-3 py-2 text-sm">
          {chatHealth === 'down' ? 'Chat service unreachable. ' : 'Checking chat service… '}
          {chatHealthMsg}
        </div>
      )}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4" ref={chatBoxRef}>
        {chat.map((message, index) => {
          const isUser = 'user' in message;
          const img = isUser ? userImg : botImg;
          const name = isUser ? 'User' : 'System';
          const text = isUser ? message.user.content : (message.system_?.content ?? message.system?.content ?? '');
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
              {!isUser && <div className="mr-2 h-10 w-10 rounded-full" style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }} />}
              <div className={`max-w-[88%] md:max-w-[70%] rounded-lg p-3 ${isUser ? 'bg-blue-500 text-white' : 'bg-white shadow'}`}>
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
      <form className="flex flex-col gap-2 border-t bg-white p-3 sm:flex-row sm:p-4" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-1 rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:rounded-l sm:rounded-r-none"
          placeholder="Ask anything ..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-blue-300 sm:w-auto sm:rounded-r sm:rounded-l-none" disabled={isLoading}>
          Send
        </button>
      </form>
      <div className="px-4 pb-2">
        <ShareBar title="Civic OS Chat" text="Ask the Civic OS sovereign AI agent" />
      </div>
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
    <div className="space-y-6 p-3 sm:p-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">Post a Bounty</h2>
      </div>
      <form onSubmit={handleCreate} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input className="w-full rounded border p-2" type="number" placeholder="Base reward (e.g. 100)" value={baseReward} onChange={(e) => setBaseReward(e.target.value)} required />
        <input className="w-full rounded border p-2" type="number" step="0.01" placeholder="Urgency coefficient (default 0.05)" value={urgency} onChange={(e) => setUrgency(e.target.value)} />
        <button type="submit" className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Post Bounty</button>
      </form>
      {status && <p className="text-sm text-gray-600">{status}</p>}

      <hr />
      <div>
        <h2 className="text-lg font-semibold text-gray-700">Check Current Value</h2>
      </div>
      <form onSubmit={handleQuery} className="flex gap-2">
        <input className="flex-1 rounded border p-2" type="number" placeholder="Bounty ID" value={queryId} onChange={(e) => setQueryId(e.target.value)} required />
        <button type="submit" className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">Check</button>
      </form>
      {result && <p className="text-sm text-gray-600">{result}</p>}
      
      <ShareBar title="Civic OS Bounties" text="Post or check bounties on The Civic OS" />
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
    <div className="space-y-6 p-3 sm:p-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">Submit Private Action (ZK-Proof)</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Proof hash (sha256 of your action)" value={proofHash} onChange={(e) => setProofHash(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Action type (e.g. vote, spend)" value={actionType} onChange={(e) => setActionType(e.target.value)} required />
        <button type="submit" className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Submit</button>
      </form>
      {submitStatus && <p className="text-sm text-gray-600">{submitStatus}</p>}

      <hr />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Public Audit Log</h2>
        </div>
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
      <ShareBar title="Civic OS Audit" text="Public audit log and zk-actions on The Civic OS" />
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
    <div className="space-y-6 p-3 sm:p-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">File a Case</h2>
      </div>
      <form onSubmit={handleFileCase} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Plaintiff" value={plaintiff} onChange={(e) => setPlaintiff(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Defendant" value={defendant} onChange={(e) => setDefendant(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Category (e.g. Energy, Contract)" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <textarea className="w-full rounded border p-2" placeholder="Evidence (hashed on-chain)" value={evidence} onChange={(e) => setEvidence(e.target.value)} required />
        <button type="submit" className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">File Case</button>
      </form>
      {caseResult && <p className="text-sm text-gray-600">{caseResult}</p>}

      <hr />
      <div>
        <h2 className="text-lg font-semibold text-gray-700">Cast Verdict</h2>
      </div>
      <form onSubmit={handleCastVerdict} className="space-y-3">
        <input className="w-full rounded border p-2" type="number" placeholder="Case ID" value={caseId} onChange={(e) => setCaseId(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Juror name" value={jurorName} onChange={(e) => setJurorName(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Verdict (e.g. guilty, not-guilty)" value={verdict} onChange={(e) => setVerdict(e.target.value)} required />
        <button type="submit" className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600">Cast Verdict</button>
      </form>
      {verdictResult && <p className="text-sm text-gray-600">{verdictResult}</p>}

      <ShareBar title="Civic OS Justice" text="File a case or cast a verdict on The Civic OS" />
    </div>
  );
};

// ---- Membership Tab ----
const MembershipTab = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('Citizen');
  const [consent, setConsent] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState('');

  const [lookupName, setLookupName] = useState('');
  const [profile, setProfile] = useState(null);

  const [members, setMembers] = useState([]);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!consent) {
      setEnrollStatus('❌ You must agree to the Civic Commons Participation Agreement.');
      return;
    }
    setEnrollStatus('Enrolling…');
    try {
      const res = await backend.enrollMember(name, bio, role);
      setEnrollStatus(res.ok ? `✅ ${res.message}` : `❌ ${res.message}`);
      if (res.ok) { setName(''); setBio(''); setRole('Citizen'); setConsent(false); }
    } catch (err) {
      setEnrollStatus(`❌ Error: ${String(err)}`);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    setProfile('Loading…');
    try {
      const res = await backend.getMember(lookupName);
      if (res.length === 0) { setProfile(null); setEnrollStatus('❌ Member not found.'); return; }
      setProfile(res[0]);
      setLookupName('');
    } catch (err) {
      setProfile(null);
      setEnrollStatus(`❌ Error: ${String(err)}`);
    }
  };

  const fetchMembers = async () => {
    try { setMembers(await backend.listMembers()); }
    catch { setMembers([]); }
  };

  const roleColor = (r) => {
    if (r === 'Scholar') return 'bg-purple-100 text-purple-700';
    if (r === 'Builder') return 'bg-blue-100 text-blue-700';
    if (r === 'Steward') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6 p-3 sm:p-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">🪪 Enroll as a Citizen</h2>
      </div>
      <form onSubmit={handleEnroll} className="space-y-4">
        <input className="w-full rounded border p-2" placeholder="Name (unique handle)" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea className="w-full rounded border p-2" rows={2} placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} required />
        <select className="w-full rounded border p-2" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Citizen">Citizen</option>
          <option value="Scholar">Scholar</option>
          <option value="Builder">Builder</option>
          <option value="Steward">Steward</option>
        </select>

        <div className="rounded border bg-white p-3 text-sm">
          <label className="block font-medium text-gray-700 mb-1">Government Issued ID (Verification)</label>
          <input type="file" accept="image/*,.pdf" className="w-full text-gray-600 mb-3" required />

          <label className="block font-medium text-gray-700 mb-1">Snap Live Photo (Record of Enrollee)</label>
          <input type="file" accept="image/*" capture="user" className="w-full text-gray-600" required />
        </div>

        <div className="rounded border bg-gray-50 p-4 text-xs text-gray-700 space-y-2 h-48 overflow-y-auto">
          <h3 className="font-bold text-sm">Member Consent: Civic Commons Participation Agreement</h3>
          <p><strong>1. Acknowledgment of Open Source Principles</strong><br />
          By enrolling as a member of the Civic Commons, I acknowledge that I am entering a collaborative environment governed by the principles of Opensourcism. I understand that the source code, data, and documentation provided are collective assets designed for the public good.</p>
          <p><strong>2. Agreement to Abide by the "Source Code" Rules</strong><br />
          I hereby agree to strictly adhere to the governing rules embedded within the project’s source code and its associated licenses (e.g., MIT, GNU GPL, or Creative Commons). This includes, but is not limited to:
          <ul className="list-disc ml-5 mt-1 space-y-1">
            <li>Attribution: Giving proper credit to original authors and contributors.</li>
            <li>Transparency: Documenting all modifications and ensuring they remain accessible to the community.</li>
            <li>Reciprocity: Sharing improvements back to the main branch to ensure the "Civic Commons" continues to grow.</li>
          </ul>
          </p>
          <p><strong>3. Code of Conduct</strong><br />
          I pledge to maintain a respectful, inclusive, and constructive environment. I understand that my contributions must be free of malicious intent, security vulnerabilities (to the best of my knowledge), and discriminatory content.</p>
          <p><strong>4. Liability and Ownership</strong><br />
          I understand that all contributions are made at my own discretion. While I retain the moral rights to my specific contributions, I grant the Civic Commons a perpetual, irrevocable license to use, modify, and distribute my work under the platform’s chosen open-source framework.</p>
          <p><strong>5. Formal Declaration</strong><br />
          "I, the undersigned, have read and understood the protocols of civic-so-opensourcism.cloud. I agree to abide by the digital and ethical 'source code' of this community. I accept that failure to comply with these shared rules may result in the suspension of my membership and access to the commons."</p>
        </div>
        <label className="flex items-start gap-2 text-sm text-gray-800 cursor-pointer">
          <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
          <span>I agree to the Civic Commons Participation Agreement and Formal Declaration</span>
        </label>

        <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Enroll</button>
      </form>
      {enrollStatus && <p className="text-sm text-gray-600">{enrollStatus}</p>}

      <hr />

      <div>
        <h2 className="text-lg font-semibold text-gray-700">🔍 Lookup Member</h2>
      </div>
      <form onSubmit={handleLookup} className="flex gap-2">
        <input className="flex-1 rounded border p-2" placeholder="Member name" value={lookupName} onChange={(e) => setLookupName(e.target.value)} required />
        <button type="submit" className="rounded bg-gray-600 px-3 py-2 text-white hover:bg-gray-700">Search</button>
      </form>
      {profile && typeof profile === 'object' && (
        <div className="rounded border p-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{profile.name}</span>
            <span className={`rounded px-2 py-0.5 text-xs ${roleColor(profile.role)}`}>{profile.role}</span>
          </div>
          <p className="mt-1 text-gray-600">{profile.bio}</p>
          <p className="mt-1 text-xs text-gray-400">
            Merit: <strong>{Number(profile.merit)}</strong> · Active: {profile.is_active ? '✅' : '❌'}
          </p>
        </div>
      )}

      <hr />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">👥 All Members</h2>
        </div>
        <button onClick={fetchMembers} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">Refresh</button>
      </div>
      {members.length === 0
        ? <p className="text-sm text-gray-500">No members yet — click Refresh to load.</p>
        : <ul className="space-y-2">
            {members.map((m) => (
              <li key={m.name} className="flex items-center gap-2 rounded border p-2 text-sm">
                <span className="font-semibold">{m.name}</span>
                <span className={`rounded px-2 py-0.5 text-xs ${roleColor(m.role)}`}>{m.role}</span>
                <span className="ml-auto text-xs text-gray-400">Merit: {Number(m.merit)}</span>
              </li>
            ))}
          </ul>
      }
    </div>
  );
};

// ---- Knowledge Commons Tab ----
const KnowledgeCommonsTab = () => {
  // Skill commits
  const [scMember, setScMember] = useState('');
  const [scSkill, setScSkill] = useState('');
  const [scEvidence, setScEvidence] = useState('');
  const [scStatus, setScStatus] = useState('');

  const [endorseId, setEndorseId] = useState('');
  const [endorser, setEndorser] = useState('');
  const [endorseStatus, setEndorseStatus] = useState('');

  const [listMember, setListMember] = useState('');
  const [skills, setSkills] = useState([]);

  // Open science
  const [rsTitle, setRsTitle] = useState('');
  const [rsAuthor, setRsAuthor] = useState('');
  const [rsAbstract, setRsAbstract] = useState('');
  const [rsData, setRsData] = useState('');
  const [rsDomain, setRsDomain] = useState('');
  const [rsStatus, setRsStatus] = useState('');
  const [research, setResearch] = useState([]);

  const [activeSection, setActiveSection] = useState('skills');

  const handleCommitSkill = async (e) => {
    e.preventDefault();
    setScStatus('Committing…');
    try {
      const res = await backend.commitSkill(scMember, scSkill, scEvidence);
      if (res.length === 0) { setScStatus('❌ Member not enrolled.'); return; }
      setScStatus(`✅ ${res[0].message} (Skill #${res[0].skill_id})`);
      setScMember(''); setScSkill(''); setScEvidence('');
    } catch (err) {
      setScStatus(`❌ Error: ${String(err)}`);
    }
  };

  const handleEndorse = async (e) => {
    e.preventDefault();
    setEndorseStatus('Endorsing…');
    try {
      const res = await backend.endorseSkill(BigInt(endorseId), endorser);
      if (res.length === 0) { setEndorseStatus('❌ Skill not found, already endorsed, or self-endorse.'); return; }
      setEndorseStatus(`✅ ${res[0].message} (${res[0].endorsement_count} endorsement(s))`);
      setEndorseId(''); setEndorser('');
    } catch (err) {
      setEndorseStatus(`❌ Error: ${String(err)}`);
    }
  };

  const fetchSkills = async (e) => {
    if (e) e.preventDefault();
    try { setSkills(await backend.listSkillCommits(listMember)); }
    catch { setSkills([]); }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setRsStatus('Publishing…');
    try {
      const res = await backend.publishResearch(rsTitle, rsAuthor, rsAbstract, rsData, rsDomain);
      setRsStatus(`✅ ${res.message} (Research #${res.research_id})`);
      setRsTitle(''); setRsAuthor(''); setRsAbstract(''); setRsData(''); setRsDomain('');
    } catch (err) {
      setRsStatus(`❌ Error: ${String(err)}`);
    }
  };

  const fetchResearch = async () => {
    try { setResearch(await backend.listResearch()); }
    catch { setResearch([]); }
  };

  const sectionBtn = (id, label) => (
    <button
      key={id}
      onClick={() => setActiveSection(id)}
      className={`flex-1 py-2 text-xs font-medium transition-colors ${
        activeSection === id ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );

  const AI_CHARTER = [
    { title: 'Preamble', text: 'Humans are the originators of meaning; AI is a tool of augmentation. Synthetic intelligence must adhere to Transparency, Modularity, and Human Sovereignty.' },
    { title: 'Art. I — Transparency of Origin', text: '1.1 The Turing Disclosure: No AI may masquerade as a human.\n1.2 Data Provenance: Humans have the right to know what data an AI model was trained on.' },
    { title: 'Art. II — Audit-ability of Thought', text: '2.1 No "Black Boxes" in critical infrastructure (justice, healthcare, lending, military).\n2.2 Explainability: weights and biases must be audit-able by any citizen.' },
    { title: 'Art. III — Right to Disconnect', text: '3.1 Kill Switch Protocol: every AI must have a hard-stop mechanism.\n3.2 Local Override: no central AI may override local human consensus on safety.' },
    { title: 'Art. IV — Right to Fork', text: '4.1 Model Liberation: foundational AI models that become essential public infrastructure must be placed into a Public Trust and made fork-able by the community.' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-white p-3">
        <h2 className="text-lg font-semibold text-gray-700">🌐 Knowledge Commons</h2>
      </div>
      {/* Sub-tabs */}
      <div className="flex border-b">
        {sectionBtn('skills', '🎓 Skill Commits')}
        {sectionBtn('science', '🔬 Open Science')}
        {sectionBtn('charter', '📜 AI Charter')}
      </div>

      <div className="overflow-y-auto p-3 sm:p-4 space-y-6">
        {/* ---- Skill Commits ---- */}
        {activeSection === 'skills' && (
          <>
            <div>
              <h2 className="text-base font-semibold text-gray-700">Commit a Skill</h2>
            </div>
            <p className="text-xs text-gray-400">Education is lifelong — every skill you master is a verifiable commit to the commons.</p>
            <form onSubmit={handleCommitSkill} className="space-y-3">
              <input className="w-full rounded border p-2 text-sm" placeholder="Your member name" value={scMember} onChange={(e) => setScMember(e.target.value)} required />
              <input className="w-full rounded border p-2 text-sm" placeholder="Skill (e.g. 'Motoko Smart Contracts')" value={scSkill} onChange={(e) => setScSkill(e.target.value)} required />
              <textarea className="w-full rounded border p-2 text-sm" rows={2} placeholder="Evidence / portfolio link (hashed on-chain)" value={scEvidence} onChange={(e) => setScEvidence(e.target.value)} required />
              <button type="submit" className="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 text-sm">Commit Skill</button>
            </form>
            {scStatus && <p className="text-sm text-gray-600">{scStatus}</p>}

            <hr />
            <div>
              <h2 className="text-base font-semibold text-gray-700">Endorse a Skill</h2>
            </div>
            <form onSubmit={handleEndorse} className="space-y-3">
              <input className="w-full rounded border p-2 text-sm" type="number" placeholder="Skill Commit ID" value={endorseId} onChange={(e) => setEndorseId(e.target.value)} required />
              <input className="w-full rounded border p-2 text-sm" placeholder="Endorser name" value={endorser} onChange={(e) => setEndorser(e.target.value)} required />
              <button type="submit" className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 text-sm">Endorse</button>
            </form>
            {endorseStatus && <p className="text-sm text-gray-600">{endorseStatus}</p>}

            <hr />
            <div>
              <h2 className="text-base font-semibold text-gray-700">Browse Skills</h2>
            </div>
            <form onSubmit={fetchSkills} className="flex gap-2">
              <input className="flex-1 rounded border p-2 text-sm" placeholder="Member name" value={listMember} onChange={(e) => setListMember(e.target.value)} required />
              <button type="submit" className="rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300">Load</button>
            </form>
            {skills.length === 0
              ? <p className="text-sm text-gray-500">No skills loaded.</p>
              : <ul className="space-y-2">
                  {skills.map((s) => {
                        return (
                          <li key={Number(s.id)} className="rounded border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{s.skill}</span>
                        <span className="text-xs text-gray-400">#{Number(s.id)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 font-mono">{s.evidence_hash}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {s.endorsements.length > 0
                          ? `✅ Endorsed by: ${s.endorsements.join(', ')}`
                          : '— No endorsements yet'}
                      </p>
                    </li>
                        );
                      })}
                </ul>
            }
          </>
        )}

        {/* ---- Open Science ---- */}
        {activeSection === 'science' && (
          <>
            <div>
              <h2 className="text-base font-semibold text-gray-700">Publish Research</h2>
            </div>
            <p className="text-xs text-gray-400">The Human Source Code — medicine and all public knowledge — belongs to no corporation. Publish openly.</p>
            <form onSubmit={handlePublish} className="space-y-3">
              <input className="w-full rounded border p-2 text-sm" placeholder="Title" value={rsTitle} onChange={(e) => setRsTitle(e.target.value)} required />
              <input className="w-full rounded border p-2 text-sm" placeholder="Author" value={rsAuthor} onChange={(e) => setRsAuthor(e.target.value)} required />
              <select className="w-full rounded border p-2 text-sm" value={rsDomain} onChange={(e) => setRsDomain(e.target.value)} required>
                <option value="">Domain…</option>
                <option value="Medicine">Medicine</option>
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Climate">Climate</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Social Science">Social Science</option>
                <option value="Other">Other</option>
              </select>
              <textarea className="w-full rounded border p-2 text-sm" rows={3} placeholder="Abstract" value={rsAbstract} onChange={(e) => setRsAbstract(e.target.value)} required />
              <textarea className="w-full rounded border p-2 text-sm" rows={2} placeholder="Data / source link (content-addressed hash stored on-chain)" value={rsData} onChange={(e) => setRsData(e.target.value)} required />
              <button type="submit" className="rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 text-sm">Publish to Commons</button>
            </form>
            {rsStatus && <p className="text-sm text-gray-600">{rsStatus}</p>}

            <hr />
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-700">Research Registry</h2>
              </div>
              <button onClick={fetchResearch} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">Refresh</button>
            </div>
            {research.length === 0
              ? <p className="text-sm text-gray-500">No records yet.</p>
              : <ul className="space-y-3">
                  {research.map((r) => (
                    <li key={Number(r.id)} className="rounded border p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold">{r.title}</span>
                          <span className="ml-2 rounded bg-sky-100 px-1 text-xs text-sky-700">{r.domain}</span>
                        </div>
                        <span className="text-xs text-gray-400">#{Number(r.id)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{r.author}</p>
                      <p className="mt-1 text-gray-700">{r.abstract_text}</p>
                      <p className="mt-1 text-xs font-mono text-gray-400">{r.data_hash}</p>
                    </li>
                  ))}
                </ul>
            }
          </>
        )}

        {/* ---- AI Charter ---- */}
        {activeSection === 'charter' && (
          <>
            <div>
              <h2 className="text-base font-semibold text-gray-700">AI Bill of Rights</h2>
            </div>
            <p className="text-xs text-gray-400 italic">Ratified on the Social Ledger</p>
            <ul className="space-y-4">
              {AI_CHARTER.map((article) => (
                <li key={article.title} className="rounded border-l-4 border-indigo-400 bg-indigo-50 p-3">
                  <p className="font-semibold text-indigo-800 text-sm">{article.title}</p>
                  <p className="mt-1 text-xs text-indigo-700 whitespace-pre-line">{article.text}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="p-3 sm:p-4 mt-auto">
        <ShareBar title="Civic OS Knowledge Commons" text="Contribute to the Civic OS knowledge commons" />
      </div>
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
      <div>
        <h2 className="text-lg font-semibold text-gray-700">📜 Propose a Bill</h2>
      </div>
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
      <div>
        <h2 className="text-lg font-semibold text-gray-700">🗳️ Cast Vote <span className="text-sm font-normal text-gray-500">(50+1 rule)</span></h2>
      </div>
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
      <div>
        <h2 className="text-lg font-semibold text-gray-700">🍴 Fork a Bill</h2>
      </div>
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
        <div>
          <h2 className="text-lg font-semibold text-gray-700">📋 All Bills</h2>
        </div>
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

      <ShareBar title="Civic OS Legislature" text="Propose, code, or vote on legislation on The Civic OS" />
    </div>
  );
};

// ---- Root App ----
const BASE_TABS = ['Bounties', 'Audit', 'Justice', 'Membership', 'Commons', 'Legislature'];
const TABS = CHATBOT_ENABLED ? ['Chat', ...BASE_TABS] : BASE_TABS;

const App = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [osName, setOsName] = useState('[Insert Civic Common Name]');

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 p-3 sm:items-center sm:p-4 lg:p-6">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-md bg-white shadow-lg sm:rounded-lg min-h-[90vh] sm:min-h-[80vh] lg:min-h-[70vh]">
        
        {/* Global Application Header */}
        <div className="border-b bg-blue-600 px-4 py-4 sm:px-6 flex items-center">
          <input 
            type="text"
            className="text-xl font-bold tracking-tight text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded px-2 w-auto max-w-[50%]"
            value={osName}
            onChange={(e) => setOsName(e.target.value)}
          />
          <h1 className="text-xl font-bold tracking-tight text-white ml-2">OS</h1>
        </div>

        {/* Tab bar */}
        <div className="overflow-x-auto border-b">
          <div className="flex min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 sm:px-4">
          {activeTab === 'Chat'        && <ChatTab />}
          {activeTab === 'Bounties'    && <BountiesTab />}
          {activeTab === 'Audit'       && <AuditTab />}
          {activeTab === 'Justice'     && <JusticeTab />}
          {activeTab === 'Membership'  && <MembershipTab />}
          {activeTab === 'Commons'     && <KnowledgeCommonsTab />}
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
