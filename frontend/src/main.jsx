import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { backend } from './declarations/backend/index.js';
import botImg from '/bot.svg';
import userImg from '/user.svg';
import '/index.css';

const SYSTEM_MODULES = [
  {
    name: 'Chat',
    description: 'Constitutional AI interface for civic guidance, public reasoning, and system navigation.'
  },
  {
    name: 'Bounties',
    description: 'Post and track incentive-backed public work, problem solving, and community missions.'
  },
  {
    name: 'Audit',
    description: 'Record verifiable actions and expose a public accountability log for governance events.'
  },
  {
    name: 'Justice',
    description: 'File disputes, assign jurors, and register verdicts through transparent civic procedure.'
  },
  {
    name: 'Membership',
    description: 'Enroll citizens, discover members, and inspect public profiles, roles, and merit.'
  },
  {
    name: 'Commons',
    description: 'Manage skill commits, open science publishing, and the shared knowledge charter.'
  },
  {
    name: 'Legislature',
    description: 'Propose bills, vote, and fork legislation using the social ledger workflow.'
  }
];

const SystemTab = () => (
  <div className="space-y-6 p-4">
    <div>
      <h2 className="text-lg font-semibold text-gray-700">The Civic OS</h2>
      <p className="mt-1 text-sm text-gray-600">
        A civic coordination interface for governance, justice, public knowledge, and constitutional AI on the Internet Computer.
      </p>
    </div>

    <div className="rounded-lg border border-indigo-400 bg-indigo-50 p-4">
      <p className="text-sm font-semibold text-indigo-800">System Purpose</p>
      <p className="mt-1 text-sm text-indigo-700">
        This application is not a generic LLM chatbot. The chat module is only one interface inside a larger civic operating system.
      </p>
    </div>

    <div className="space-y-3">
      {SYSTEM_MODULES.map((module) => (
        <div key={module.name} className="rounded border p-3">
          <p className="font-semibold text-gray-700">{module.name}</p>
          <p className="mt-1 text-sm text-gray-600">{module.description}</p>
        </div>
      ))}
    </div>
  </div>
);

// ---- Chat Tab ----
const ChatTab = () => {
  const [chat, setChat] = useState([
    { system: { content: 'Welcome to The Civic OS. This constitutional AI helps you navigate the civic modules, explain governance flows, and reason about public decisions.' } }
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
          placeholder="Ask Civic OS about governance, justice, membership, or the commons..."
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

// ---- Membership Tab ----
const MembershipTab = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('Citizen');
  const [enrollStatus, setEnrollStatus] = useState('');

  const [lookupName, setLookupName] = useState('');
  const [profile, setProfile] = useState(null);

  const [members, setMembers] = useState([]);

  const handleEnroll = async (e) => {
    e.preventDefault();
    setEnrollStatus('Enrolling…');
    try {
      const res = await backend.enrollMember(name, bio, role);
      setEnrollStatus(res.ok ? `✅ ${res.message}` : `❌ ${res.message}`);
      if (res.ok) { setName(''); setBio(''); setRole('Citizen'); }
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
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-semibold text-gray-700">🪪 Enroll as a Citizen</h2>
      <form onSubmit={handleEnroll} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Name (unique handle)" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea className="w-full rounded border p-2" rows={2} placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} required />
        <select className="w-full rounded border p-2" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Citizen">Citizen</option>
          <option value="Scholar">Scholar</option>
          <option value="Builder">Builder</option>
          <option value="Steward">Steward</option>
        </select>
        <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Enroll</button>
      </form>
      {enrollStatus && <p className="text-sm text-gray-600">{enrollStatus}</p>}

      <hr />

      <h2 className="text-lg font-semibold text-gray-700">🔍 Lookup Member</h2>
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
        <h2 className="text-lg font-semibold text-gray-700">👥 All Members</h2>
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
    <div className="flex flex-col">
      {/* Sub-tabs */}
      <div className="flex border-b">
        {sectionBtn('skills', '🎓 Skill Commits')}
        {sectionBtn('science', '🔬 Open Science')}
        {sectionBtn('charter', '📜 AI Charter')}
      </div>

      <div className="overflow-y-auto p-4 space-y-6">
        {/* ---- Skill Commits ---- */}
        {activeSection === 'skills' && (
          <>
            <h2 className="text-base font-semibold text-gray-700">Commit a Skill</h2>
            <p className="text-xs text-gray-400">Education is lifelong — every skill you master is a verifiable commit to the commons.</p>
            <form onSubmit={handleCommitSkill} className="space-y-3">
              <input className="w-full rounded border p-2 text-sm" placeholder="Your member name" value={scMember} onChange={(e) => setScMember(e.target.value)} required />
              <input className="w-full rounded border p-2 text-sm" placeholder="Skill (e.g. 'Motoko Smart Contracts')" value={scSkill} onChange={(e) => setScSkill(e.target.value)} required />
              <textarea className="w-full rounded border p-2 text-sm" rows={2} placeholder="Evidence / portfolio link (hashed on-chain)" value={scEvidence} onChange={(e) => setScEvidence(e.target.value)} required />
              <button type="submit" className="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 text-sm">Commit Skill</button>
            </form>
            {scStatus && <p className="text-sm text-gray-600">{scStatus}</p>}

            <hr />
            <h2 className="text-base font-semibold text-gray-700">Endorse a Skill</h2>
            <form onSubmit={handleEndorse} className="space-y-3">
              <input className="w-full rounded border p-2 text-sm" type="number" placeholder="Skill Commit ID" value={endorseId} onChange={(e) => setEndorseId(e.target.value)} required />
              <input className="w-full rounded border p-2 text-sm" placeholder="Endorser name" value={endorser} onChange={(e) => setEndorser(e.target.value)} required />
              <button type="submit" className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 text-sm">Endorse</button>
            </form>
            {endorseStatus && <p className="text-sm text-gray-600">{endorseStatus}</p>}

            <hr />
            <h2 className="text-base font-semibold text-gray-700">Browse Skills</h2>
            <form onSubmit={fetchSkills} className="flex gap-2">
              <input className="flex-1 rounded border p-2 text-sm" placeholder="Member name" value={listMember} onChange={(e) => setListMember(e.target.value)} required />
              <button type="submit" className="rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300">Load</button>
            </form>
            {skills.length === 0
              ? <p className="text-sm text-gray-500">No skills loaded.</p>
              : <ul className="space-y-2">
                  {skills.map((s) => (
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
                  ))}
                </ul>
            }
          </>
        )}

        {/* ---- Open Science ---- */}
        {activeSection === 'science' && (
          <>
            <h2 className="text-base font-semibold text-gray-700">Publish Research</h2>
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
              <h2 className="text-base font-semibold text-gray-700">Research Registry</h2>
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
            <h2 className="text-base font-semibold text-gray-700">AI Bill of Rights</h2>
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
const TABS = ['System', 'Chat', 'Bounties', 'Audit', 'Justice', 'Membership', 'Commons', 'Legislature'];

const App = () => {
  const [activeTab, setActiveTab] = useState('System');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-lg">
        <div className="border-b bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-gray-800">The Civic OS</h1>
              <p className="text-xs text-gray-500">Public governance, justice, membership, and commons infrastructure</p>
            </div>
            <div className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">Live Civic Interface</div>
          </div>
        </div>

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
          {activeTab === 'System'      && <SystemTab />}
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
