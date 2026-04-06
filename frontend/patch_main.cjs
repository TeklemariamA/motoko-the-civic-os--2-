const fs = require('fs');

let file = fs.readFileSync('frontend/src/main.jsx', 'utf8');

// Ensure import 'backend'
if (!file.includes('const handleAppeal =')) {
  file = file.replace('const [evidence, setEvidence] = useState(\'\');', 
    'const [evidence, setEvidence] = useState(\'\');\n  const [appealCaseId, setAppealCaseId] = useState(\'\');\n  const [appealResult, setAppealResult] = useState(null);\n  const [forkProposalId, setForkProposalId] = useState(\'\');\n  const [forkSignatories, setForkSignatories] = useState(\'\');\n  const [forkWallet, setForkWallet] = useState(\'\');\n  const [forkCodeBase, setForkCodeBase] = useState(\'\');\n  const [forkResult, setForkResult] = useState(null);'
  );

  file = file.replace('  const handleCastVerdict = async (e) => {', 
    `  const handleAppeal = async (e) => {
    e.preventDefault();
    try {
      const res = await backend.initiateAppeal(BigInt(appealCaseId));
      setAppealResult(res);
    } catch (err) {
      setAppealResult("Error: " + err.message);
    }
  };

  const handleExecuteFork = async (e) => {
    e.preventDefault();
    try {
      const res = await backend.executeCivicFork(BigInt(forkProposalId), BigInt(forkSignatories), forkWallet, forkCodeBase);
      setForkResult(res);
    } catch (err) {
      setForkResult("Error: " + err.message);
    }
  };

  const handleCastVerdict = async (e) => {`
  );

  file = file.replace('</button>\n      </form>\n      {verdictResult && <p className="text-sm text-gray-600">{verdictResult}</p>}', 
    `</button>
      </form>
      {verdictResult && <p className="text-sm text-gray-600">{verdictResult}</p>}

      <hr />
      <div>
        <h2 className="text-lg font-semibold text-gray-700">Initiate Appeal</h2>
      </div>
      <form onSubmit={handleAppeal} className="space-y-3">
        <input className="w-full rounded border p-2" type="number" placeholder="Case ID" value={appealCaseId} onChange={(e) => setAppealCaseId(e.target.value)} required />
        <button type="submit" className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Initiate Appeal</button>
      </form>
      {appealResult && <p className="text-sm text-gray-600">{appealResult}</p>}

      <hr />
      <div>
        <h2 className="text-lg font-semibold text-gray-700">Execute Civic Fork</h2>
      </div>
      <form onSubmit={handleExecuteFork} className="space-y-3">
        <input className="w-full rounded border p-2" type="number" placeholder="Proposal ID" value={forkProposalId} onChange={(e) => setForkProposalId(e.target.value)} required />
        <input className="w-full rounded border p-2" type="number" placeholder="Signatories Count" value={forkSignatories} onChange={(e) => setForkSignatories(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="New Wallet Address" value={forkWallet} onChange={(e) => setForkWallet(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="New Code Base URL" value={forkCodeBase} onChange={(e) => setForkCodeBase(e.target.value)} required />
        <button type="submit" className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600">Execute Fork</button>
      </form>
      {forkResult && <p className="text-sm text-gray-600">{forkResult}</p>}
`
  );

  fs.writeFileSync('frontend/src/main.jsx', file);
  console.log("Updated main.jsx");
}
