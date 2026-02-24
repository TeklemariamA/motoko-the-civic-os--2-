import React from 'react';

const TrustBadge = ({ level }) => {
  const config = {
    Exemplary: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '🏆' },
    Trusted:   { color: 'bg-blue-100 text-blue-700 border-blue-200',          icon: '⭐' },
    Active:    { color: 'bg-yellow-100 text-yellow-700 border-yellow-200',    icon: '🌱' },
    New:       { color: 'bg-gray-100 text-gray-600 border-gray-200',          icon: '🔰' },
  };
  const { color, icon } = config[level] || config.New;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${color}`}>
      {icon} {level}
    </span>
  );
};

const MeritBar = ({ value }) => (
  <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
    <div
      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

const CitizenTrustDashboard = ({ users, cases, auditLog }) => {
  const totalMerit = users.reduce((sum, u) => sum + u.merit, 0);
  const avgMerit = users.length ? Math.round(totalMerit / users.length) : 0;
  const openCases = cases.filter((c) => c.status === 'open' || c.status === 'deliberating').length;
  const resolvedCases = cases.filter((c) => c.status === 'resolved').length;
  const verifiedActions = auditLog.filter((e) => e.verified).length;

  const stats = [
    { label: 'Active Citizens', value: users.length, icon: '👥' },
    { label: 'Avg Merit Score', value: avgMerit, icon: '📊' },
    { label: 'Open Cases', value: openCases, icon: '⚖️' },
    { label: 'Resolved Cases', value: resolvedCases, icon: '✅' },
    { label: 'Verified Actions', value: verifiedActions, icon: '🔐' },
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">🏛️</span> Citizen Trust Dashboard
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-6">
        {stats.map(({ label, value, icon }) => (
          <div key={label} className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-3">Citizen Merit Leaderboard</h3>
      <div className="space-y-3">
        {[...users]
          .sort((a, b) => b.merit - a.merit)
          .map((u, idx) => {
            const level =
              u.merit >= 80 ? 'Exemplary' :
              u.merit >= 50 ? 'Trusted' :
              u.merit >= 20 ? 'Active' : 'New';
            return (
              <div key={u.username} className="flex items-center gap-3">
                <span className="w-6 text-sm text-gray-400 text-right font-mono">#{idx + 1}</span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-800 truncate">{u.username}</span>
                    <span className="text-sm font-bold text-gray-900 flex-shrink-0">{u.merit}</span>
                  </div>
                  <MeritBar value={u.merit} />
                </div>
                <TrustBadge level={level} />
              </div>
            );
          })}
      </div>
    </section>
  );
};

export default CitizenTrustDashboard;
