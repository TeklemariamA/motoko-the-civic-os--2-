import React, { useState } from 'react';

const TransparencyToggle = ({ auditLog }) => {
  const [isVisible, setIsVisible] = useState(false);

  const formatTime = (ts) => {
    const d = new Date(ts * 1000);
    return d.toLocaleString();
  };

  const truncateHash = (hash) =>
    hash ? `${hash.slice(0, 8)}…${hash.slice(-8)}` : '—';

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🔍</span> Transparency Toggle
        </h2>
        <button
          onClick={() => setIsVisible((v) => !v)}
          className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
            isVisible ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          style={{ width: '3.25rem' }}
          aria-label="Toggle public audit log visibility"
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              isVisible ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {isVisible
          ? 'Public audit log is visible. All entries are anonymised — actions are shown without identity.'
          : 'Toggle on to inspect the public audit ledger. Your identity remains protected via zero-knowledge proofs.'}
      </p>

      {isVisible && (
        <div>
          {auditLog.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No entries in the public audit log yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-2">Timestamp</th>
                    <th className="px-4 py-2">Action</th>
                    <th className="px-4 py-2">Proof Signature</th>
                    <th className="px-4 py-2">Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {auditLog.map((entry, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {formatTime(entry.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{entry.action}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {truncateHash(entry.proof_signature)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                            entry.verified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {entry.verified ? '✔ Yes' : '✗ No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default TransparencyToggle;
