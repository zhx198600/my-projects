const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('Test server starting...');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Test server is running' });
});

const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log('Test server started!');
  console.log(`http://localhost:${PORT}`);
  console.log('=================================');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

console.log('Server setup complete, waiting for connections...');
