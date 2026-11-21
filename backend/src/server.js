const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const healthRoute = require('./routes/health');

const app = express();

// TEMPORARY: restrict origins before launch
app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/v1', healthRoute);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600
    ? error.status
    : 500;
  const message = status === 500 ? 'Internal server error' : error.message;
  res.status(status).json({ error: message });
});

async function startServer() {
  await connectDB();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  });
}

module.exports = app;
