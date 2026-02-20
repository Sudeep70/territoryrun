const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export async function saveRun(runData) {
  const res = await fetch(`${BASE_URL}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(runData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchRuns() {
  const res = await fetch(`${BASE_URL}/runs`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteRun(id) {
  const res = await fetch(`${BASE_URL}/runs/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/stats`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
