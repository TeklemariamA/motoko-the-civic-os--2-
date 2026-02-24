import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import '/index.css';

import MyIdentity from './components/MyIdentity';
import MyParticipation from './components/MyParticipation';
import TransparencyToggle from './components/TransparencyToggle';
import CitizenTrustDashboard from './components/CitizenTrustDashboard';
import AIChat from './components/AIChat';

// --- Seed data representing the Civic-OS backend state ---
const INITIAL_STATE = {
  currentUser: {
    username: 'elara',
    principalId: 'aaaaa-aa...elara',
    merit: 50,
  },
  users: [
    { username: 'elara', merit: 50 },
    { username: 'devon', merit: 20 },
    { username: 'sakura', merit: 82 },
    { username: 'marcus', merit: 37 },
  ],
  bounties: [
    { id: 1, description: 'Audit city energy contracts Q1', base_reward: 10, urgency_coeff: 0.05, created_at: Date.now() / 1000 - 3600, status: 'open', claimed_by: null },
    { id: 2, description: 'Review school board conduct report', base_reward: 8, urgency_coeff: 0.03, created_at: Date.now() / 1000 - 7200, status: 'claimed', claimed_by: 'elara' },
    { id: 3, description: 'Verify infrastructure procurement data', base_reward: 20, urgency_coeff: 0.1, created_at: Date.now() / 1000 - 1800, status: 'open', claimed_by: null },
  ],
  cases: [
    { id: 1, category: 'Contract', plaintiff: 'elara', defendant: 'devon', evidence_hash: 'abc123', jurors: ['sakura', 'marcus'], votes: {}, status: 'open' },
    { id: 2, category: 'Conduct', plaintiff: 'marcus', defendant: 'sakura', evidence_hash: 'def456', jurors: ['elara', 'devon'], votes: { elara: 'guilty' }, status: 'deliberating' },
  ],
  auditLog: [
    { timestamp: Date.now() / 1000 - 600, action: 'voted', proof_signature: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', verified: true },
    { timestamp: Date.now() / 1000 - 1200, action: 'reviewed', proof_signature: 'f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1', verified: true },
    { timestamp: Date.now() / 1000 - 3000, action: 'filed_case', proof_signature: '1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b', verified: true },
  ],
};

const NAV_ITEMS = [
  { id: 'identity',    label: 'My Identity',            icon: '🪪' },
  { id: 'participation', label: 'My Participation',     icon: '🗳️' },
  { id: 'transparency', label: 'Transparency',          icon: '🔍' },
  { id: 'trust',       label: 'Trust Dashboard',        icon: '🏛️' },
  { id: 'chat',        label: 'AI Civic Agent',         icon: '🤖' },
];

const App = () => {
  const [activeSection, setActiveSection] = useState('identity');
  const [state, setState] = useState(INITIAL_STATE);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleGenerateProof = (hash, action) => {
    setState((prev) => ({
      ...prev,
      auditLog: [
        { timestamp: Date.now() / 1000, action, proof_signature: hash, verified: true },
        ...prev.auditLog,
      ],
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <span className="text-2xl">🏛️</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Civic-OS</h1>
            <p className="text-xs text-gray-500">The Purist Protocol v2</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                activeSection === id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {state.currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-800 truncate">{state.currentUser.username}</p>
              <p className="text-xs text-gray-400">Merit: {state.currentUser.merit}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-800 focus:outline-none"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-bold text-gray-900">Civic-OS</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {activeSection === 'identity' && (
              <MyIdentity
                user={state.currentUser}
                onGenerateProof={handleGenerateProof}
              />
            )}
            {activeSection === 'participation' && (
              <MyParticipation
                bounties={state.bounties}
                cases={state.cases}
                username={state.currentUser.username}
              />
            )}
            {activeSection === 'transparency' && (
              <TransparencyToggle auditLog={state.auditLog} />
            )}
            {activeSection === 'trust' && (
              <CitizenTrustDashboard
                users={state.users}
                cases={state.cases}
                auditLog={state.auditLog}
              />
            )}
            {activeSection === 'chat' && <AIChat />}
          </div>
        </main>
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
