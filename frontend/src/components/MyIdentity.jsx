import React, { useState } from 'react';

const MyIdentity = ({ user, onGenerateProof }) => {
  const [proofAction, setProofAction] = useState('');
  const [proofResult, setProofResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateProof = async () => {
    if (!proofAction.trim()) return;
    setIsGenerating(true);
    setProofResult(null);
    setTimeout(() => {
      const mockHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setProofResult(mockHash);
      setIsGenerating(false);
      if (onGenerateProof) onGenerateProof(mockHash, proofAction);
    }, 800);
  };

  const meritLevel =
    user.merit >= 80 ? 'Exemplary' :
    user.merit >= 50 ? 'Trusted' :
    user.merit >= 20 ? 'Active' : 'New';

  const meritColor =
    user.merit >= 80 ? 'text-emerald-600' :
    user.merit >= 50 ? 'text-blue-600' :
    user.merit >= 20 ? 'text-yellow-600' : 'text-gray-500';

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">🪪</span> My Identity
      </h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold select-none">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{user.username}</p>
          <p className="text-sm text-gray-500">Principal ID: <span className="font-mono text-xs">{user.principalId}</span></p>
          <p className={`text-sm font-medium mt-1 ${meritColor}`}>
            Citizen Status: {meritLevel}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Merit Score</span>
          <span className="font-semibold">{user.merit} / 100</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(user.merit, 100)}%` }}
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Generate ZK Proof</h3>
        <p className="text-xs text-gray-500 mb-3">
          Prove you performed an action without revealing your identity on the public ledger.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Action (e.g. voted, reviewed)"
            value={proofAction}
            onChange={(e) => setProofAction(e.target.value)}
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerateProof}
            disabled={isGenerating || !proofAction.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isGenerating ? '…' : 'Prove'}
          </button>
        </div>
        {proofResult && (
          <div className="mt-3 rounded bg-green-50 border border-green-200 p-3">
            <p className="text-xs text-green-700 font-semibold mb-1">✔ Proof generated (anonymized):</p>
            <p className="font-mono text-xs text-green-800 break-all">{proofResult}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyIdentity;
