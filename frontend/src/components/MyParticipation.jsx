import React, { useState } from 'react';

const computeCurrentReward = (b) => {
  const elapsed = Date.now() / 1000 - b.created_at;
  return b.base_reward * (1 + b.urgency_coeff * (elapsed / 60));
};

const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-700',
  claimed: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
  resolved: 'bg-purple-100 text-purple-700',
  deliberating: 'bg-orange-100 text-orange-700',
};

const MyParticipation = ({ bounties, cases, username }) => {
  const [activeTab, setActiveTab] = useState('bounties');

  const myBounties = bounties.filter(
    (b) => b.claimed_by === username || b.status === 'open'
  );
  const myCases = cases.filter(
    (c) => c.plaintiff === username || c.defendant === username || c.jurors.includes(username)
  );

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">🗳️</span> My Participation
      </h2>

      <div className="flex gap-2 mb-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('bounties')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'bounties'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Bounties ({myBounties.length})
        </button>
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'cases'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Cases ({myCases.length})
        </button>
      </div>

      {activeTab === 'bounties' && (
        <div className="space-y-3">
          {myBounties.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No active bounties.</p>
          ) : (
            myBounties.map((b) => (
              <div key={b.id} className="rounded-lg border border-gray-100 p-4 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{b.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Reward: <span className="font-semibold text-green-700">{computeCurrentReward(b).toFixed(2)} ICP</span>
                      {b.claimed_by === username && (
                        <span className="ml-2 text-blue-600 font-medium">(Claimed by you)</span>
                      )}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'cases' && (
        <div className="space-y-3">
          {myCases.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No active cases.</p>
          ) : (
            myCases.map((c) => {
              const role =
                c.plaintiff === username ? 'Plaintiff' :
                c.defendant === username ? 'Defendant' : 'Juror';
              return (
                <div key={c.id} className="rounded-lg border border-gray-100 p-4 hover:border-purple-200 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Case #{c.id} — {c.category}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {c.plaintiff} vs {c.defendant}
                      </p>
                      <p className="text-xs text-blue-600 mt-1 font-medium">Your role: {role}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
};

export default MyParticipation;
