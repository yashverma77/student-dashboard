const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3002;
const serviceName = process.env.SERVICE_NAME || 'Notification Service';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

app.get('/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    response.json({ status: 'ok', service: serviceName });
  } catch (error) {
    response.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/', (_request, response) => {
  response.type('html').send(`
    <main style="font-family:Arial,sans-serif;max-width:760px;margin:40px auto;line-height:1.5">
      <h1>Notification Service</h1>
      <p>Use this service to publish and view campus notifications.</p>
      <ul>
        <li><a href="/notifications">Notifications API</a></li>
        <li><a href="/health">Health Check</a></li>
      </ul>
    </main>
  `);
});

app.get('/notifications', async (_request, response) => {
  const result = await pool.query(
    'SELECT id, title, message, created_at FROM notifications ORDER BY created_at DESC'
  );
  response.json(result.rows);
});

app.post('/notifications', async (request, response) => {
  const { title, message } = request.body;

  if (!title || !message) {
    return response.status(400).json({ message: 'Send title and message.' });
  }

  const result = await pool.query(
    `INSERT INTO notifications (title, message)
     VALUES ($1, $2)
     RETURNING id, title, message, created_at`,
    [title, message]
  );

  response.status(201).json(result.rows[0]);
});

app.listen(port, () => {
  console.log(`${serviceName} listening on port ${port}`);
});
