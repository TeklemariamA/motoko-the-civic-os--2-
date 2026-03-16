// localStorage-backed simulation of the CivicOS backend canister.
// All data persists across page reloads. The API surface exactly mirrors
// the Motoko actor so every UI module works without a live ICP canister.
// NOTE: _hash() is a non-cryptographic simulation matching the Motoko simpleHash helper.
// It is intentionally simple — this is a demo/simulation, not a production ZK system.

// Default system users seeded in the Motoko backend's stable initial state.
const _DEFAULT_USERS = ['elara', 'devon'];

function _get(key, def) {
  try { const v = localStorage.getItem('civicos_' + key); return v ? JSON.parse(v) : def; }
  catch { return def; }
}
function _set(key, val) {
  try { localStorage.setItem('civicos_' + key, JSON.stringify(val)); } catch { /* noop */ }
}
function _nextId(key) {
  const id = _get(key, 1);
  _set(key, id + 1);
  return id;
}
function _hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) { h = Math.imul(31, h) + text.charCodeAt(i) | 0; }
  return String(Math.abs(h));
}
function _majority(votes) {
  const c = {};
  for (const [, v] of votes) c[v] = (c[v] || 0) + 1;
  return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
}

export const backend = {

  // ---- MEMBERSHIP ----
  enrollMember: async (name, bio, role) => {
    const members = _get('members', []);
    if (members.find(m => m.name === name))
      return { ok: false, message: 'Name already enrolled' };
    members.push({ name, bio, role, joined_at: Date.now(), merit: 10, is_active: true });
    _set('members', members);
    return { ok: true, message: `Welcome to the Social OS, ${name}! Starting merit: 10` };
  },
  getMember: async (name) => {
    const found = _get('members', []).find(m => m.name === name);
    return found ? [found] : [];
  },
  listMembers: async () => _get('members', []),

  // ---- BOUNTIES ----
  createBounty: async (description, base_reward, urgency) => {
    const id = _nextId('nextBountyId');
    const bounties = _get('bounties', []);
    bounties.push({ id, description, base_reward, urgency_coeff: urgency, created_at: Date.now(), status: 'open', claimed_by: null });
    _set('bounties', bounties);
    return { message: 'Bounty posted to the grid', bounty_id: id };
  },
  getBountyValue: async (bounty_id) => {
    const id = Number(bounty_id);
    const b = _get('bounties', []).find(b => b.id === id);
    if (!b) return [];
    const elapsedMin = (Date.now() - b.created_at) / 60_000;
    return [{ id: b.id, current_reward: b.base_reward * (1 + b.urgency_coeff * elapsedMin) }];
  },

  // ---- AUDIT ----
  privateAction: async (proof_hash, action_type) => {
    const log = _get('auditLog', []);
    log.push({ timestamp_ms: Date.now(), proof_signature: proof_hash, action: action_type, verified: true });
    _set('auditLog', log);
    return { message: 'Action verified and anonymized on public ledger' };
  },
  publicLog: async () => {
    return _get('auditLog', []).map(e => ({
      ...e,
      timestamp: BigInt(e.timestamp_ms) * BigInt(1_000_000),
    }));
  },

  // ---- JUSTICE ----
  fileCase: async (plaintiff, defendant, category, evidence) => {
    const id = _nextId('nextCaseId');
    const enrolled = _get('members', []).map(m => m.name);
    const pool = [...new Set([..._DEFAULT_USERS, ...enrolled])]
      .filter(n => n !== plaintiff && n !== defendant);
    const cases = _get('cases', []);
    cases.push({ id, category, plaintiff, defendant, evidence_hash: _hash(evidence), jurors: pool, votes: [], status: 'open' });
    _set('cases', cases);
    return { case_id: id, jury: pool };
  },
  castVerdict: async (case_id, juror_name, verdict) => {
    const id = Number(case_id);
    const cases = _get('cases', []);
    const idx = cases.findIndex(c => c.id === id);
    if (idx === -1) return [];
    const c = cases[idx];
    if (!c.jurors.includes(juror_name)) return [];
    if (c.votes.find(([j]) => j === juror_name)) return [];
    const newVotes = [...c.votes, [juror_name, verdict]];
    const allVoted = newVotes.length >= c.jurors.length && c.jurors.length > 0;
    cases[idx] = { ...c, votes: newVotes, status: allVoted ? 'resolved' : 'deliberating' };
    _set('cases', cases);
    if (allVoted) {
      const m = _majority(newVotes);
      return [{ verdict: m, message: 'Case merged into the Social Ledger' }];
    }
    return [{ verdict: 'pending', message: 'Vote recorded' }];
  },

  // ---- LEGISLATURE ----
  proposeBill: async (title, body, author, category) => {
    const id = _nextId('nextBillId');
    const bills = _get('bills', []);
    bills.push({ id, title, body, author, category, status: 'active', yes_votes: 0, no_votes: 0, abstain_votes: 0, created_at: Date.now(), forked_from: [] });
    _set('bills', bills);
    return { bill_id: id, message: 'Bill proposed to the legislature' };
  },
  castVote: async (bill_id, citizen, choice) => {
    const id = Number(bill_id);
    const bills = _get('bills', []);
    const idx = bills.findIndex(b => b.id === id);
    if (idx === -1) return [];
    const bill = bills[idx];
    if (bill.status !== 'active')
      return [{ yes: bill.yes_votes, no: bill.no_votes, abstain: bill.abstain_votes, status: bill.status, message: 'Bill is no longer active' }];
    const bv = _get('billVotes', []);
    if (bv.find(([bid, cit]) => bid === id && cit === citizen)) return [];
    bv.push([id, citizen, choice]);
    _set('billVotes', bv);
    const yes = bill.yes_votes + (choice === 'yes' ? 1 : 0);
    const no  = bill.no_votes  + (choice === 'no'  ? 1 : 0);
    const abs = bill.abstain_votes + (choice === 'abstain' ? 1 : 0);
    const participating = yes + no;
    const status = (participating > 0 && yes * 2 > participating) ? 'passed' : bill.status;
    bills[idx] = { ...bill, yes_votes: yes, no_votes: no, abstain_votes: abs, status };
    _set('bills', bills);
    const message = status === 'passed' ? "Bill committed to the Social Ledger — 50+1 majority reached 🎉" : 'Vote recorded';
    return [{ yes, no, abstain: abs, status, message }];
  },
  getBill: async (bill_id) => {
    const found = _get('bills', []).find(b => b.id === Number(bill_id));
    return found ? [found] : [];
  },
  listBills: async () => _get('bills', []),
  forkBill: async (original_id, title, body, author) => {
    const orig = _get('bills', []).find(b => b.id === Number(original_id));
    if (!orig) return [];
    const id = _nextId('nextBillId');
    const bills = _get('bills', []);
    bills.push({ id, title, body, author, category: orig.category, status: 'active', yes_votes: 0, no_votes: 0, abstain_votes: 0, created_at: Date.now(), forked_from: [orig.id] });
    _set('bills', bills);
    return [{ bill_id: id, message: `Bill forked from #${orig.id}` }];
  },

  // ---- KNOWLEDGE COMMONS ----
  commitSkill: async (member, skill, evidence) => {
    if (!_get('members', []).find(m => m.name === member)) return [];
    const id = _nextId('nextSkillId');
    const sc = _get('skillCommits', []);
    sc.push({ id, member, skill, evidence_hash: _hash(evidence), endorsements: [], created_at: Date.now() });
    _set('skillCommits', sc);
    return [{ skill_id: id, message: `Skill committed: ${skill}` }];
  },
  endorseSkill: async (skill_id, endorser) => {
    const id = Number(skill_id);
    const sc = _get('skillCommits', []);
    const idx = sc.findIndex(s => s.id === id);
    if (idx === -1) return [];
    if (sc[idx].member === endorser || sc[idx].endorsements.includes(endorser)) return [];
    sc[idx] = { ...sc[idx], endorsements: [...sc[idx].endorsements, endorser] };
    _set('skillCommits', sc);
    return [{ skill_id: id, endorsement_count: sc[idx].endorsements.length, message: `${endorser} endorsed this skill` }];
  },
  listSkillCommits: async (member) => _get('skillCommits', []).filter(s => s.member === member),
  publishResearch: async (title, author, abstract_text, data, domain) => {
    const id = _nextId('nextResearchId');
    const rr = _get('researchRecords', []);
    rr.push({ id, title, author, abstract_text, data_hash: _hash(data), domain, created_at: Date.now() });
    _set('researchRecords', rr);
    return { research_id: id, message: `Research published to the commons: ${title}` };
  },
  listResearch: async () => _get('researchRecords', []),
};