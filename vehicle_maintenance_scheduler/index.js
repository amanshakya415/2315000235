import express from 'express';
import { Log, createRequestLogger } from './logging_middleware/index.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(createRequestLogger({ includeHeaders: false }));

app.get('/health', async (req, res) => {
  await Log('backend', 'info', 'route', 'Health check received and responded');
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.post('/notify', async (req, res) => {
  const { recipient, subject, message } = req.body || {};

  if (!recipient || !subject || !message) {
    await Log('backend', 'warn', 'handler', 'Notification request missing required fields');
    return res.status(400).json({ error: 'recipient, subject, and message are required' });
  }

  await Log('backend', 'debug', 'service', `Preparing notification for ${recipient}`);

  try {
    // Example processing stage; replace with actual notification logic.
    await Log('backend', 'info', 'service', `Notification queued for ${recipient} with subject: ${subject}`);
    res.status(202).json({ status: 'queued', recipient });
  } catch (error) {
    await Log('backend', 'error', 'service', `Notification processing failed for ${recipient}: ${error.message}`);
    res.status(500).json({ error: 'Unable to process notification' });
  }
});

app.use(async (err, req, res, next) => {
  await Log('backend', 'fatal', 'handler', `Unhandled error in route ${req.method} ${req.path}: ${err.message}`);
  res.status(500).json({ error: 'internal server error' });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  Log('backend', 'info', 'service', `Notification backend started on port ${port}`).catch(() => {});
});
