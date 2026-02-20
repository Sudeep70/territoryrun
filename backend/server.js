const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// ✅ FIX: Use dynamic port for Render
const PORT = process.env.PORT || 3001;

const DATA_FILE = path.join(__dirname, 'runs.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

function readRuns() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading runs:', err);
    return [];
  }
}

function writeRuns(runs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(runs, null, 2));
}

// Optional root route (prevents "Cannot GET /")
app.get('/', (req, res) => {
  res.json({ message: 'TerritoryRun API is live 🚀' });
});

// GET /runs - fetch all previous runs
app.get('/runs', (req, res) => {
  const runs = readRuns();
  res.json(runs);
});

// GET /runs/:id - fetch a single run by id
app.get('/runs/:id', (req, res) => {
  const runs = readRuns();
  const run = runs.find(r => r.id === req.params.id);
  if (!run) {
    return res.status(404).json({ error: 'Run not found' });
  }
  res.json(run);
});

// POST /run - save a new run
app.post('/run', (req, res) => {
  const { path: runPath, distance, claimedTiles, duration, startTime, endTime } = req.body;

  if (!runPath || !Array.isArray(runPath) || runPath.length < 2) {
    return res.status(400).json({ error: 'Invalid run path. Must have at least 2 points.' });
  }

  const newRun = {
    id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    path: runPath,
    distance: typeof distance === 'number' ? distance : 0,
    claimedTiles: Array.isArray(claimedTiles) ? claimedTiles : [],
    duration: typeof duration === 'number' ? duration : 0,
    startTime: startTime || new Date().toISOString(),
    endTime: endTime || new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  const runs = readRuns();
  runs.push(newRun);
  writeRuns(runs);

  console.log(`✅ Saved run ${newRun.id}`);
  res.status(201).json(newRun);
});

// DELETE /runs/:id - delete a run
app.delete('/runs/:id', (req, res) => {
  const runs = readRuns();
  const index = runs.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Run not found' });
  }
  const deleted = runs.splice(index, 1)[0];
  writeRuns(runs);
  res.json({ message: 'Run deleted', run: deleted });
});

// GET /stats - aggregate stats across all runs
app.get('/stats', (req, res) => {
  const runs = readRuns();
  const totalDistance = runs.reduce((sum, r) => sum + (r.distance || 0), 0);
  const totalDuration = runs.reduce((sum, r) => sum + (r.duration || 0), 0);
  const allTiles = new Set();
  runs.forEach(r => (r.claimedTiles || []).forEach(t => allTiles.add(t)));

  res.json({
    totalRuns: runs.length,
    totalDistance,
    totalDuration,
    uniqueTilesClaimed: allTiles.size
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TerritoryRun backend running on port ${PORT}`);
  console.log(`📁 Data file: ${DATA_FILE}`);
});