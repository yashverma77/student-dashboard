const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;
const serviceName = process.env.SERVICE_NAME || 'Student Portal';
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
      <h1>Student Portal</h1>
      <p>Use this service to view student records from the campus database.</p>
      <ul>
        <li><a href="/students">Students API</a></li>
        <li><a href="/summary">Student Summary API</a></li>
        <li><a href="/health">Health Check</a></li>
      </ul>
    </main>
  `);
});

app.get('/students', async (_request, response) => {
  const result = await pool.query(
    'SELECT id, name, email, course, created_at FROM students ORDER BY id'
  );
  response.json(result.rows);
});

app.get('/summary', async (_request, response) => {
  const result = await pool.query('SELECT COUNT(*)::int AS total_students FROM students');
  response.json({
    service: serviceName,
    totalStudents: result.rows[0].total_students,
    attendanceApi: process.env.ATTENDANCE_API_URL,
    notificationApi: process.env.NOTIFICATION_API_URL
  });
});

app.listen(port, () => {
  console.log(`${serviceName} listening on port ${port}`);
});
