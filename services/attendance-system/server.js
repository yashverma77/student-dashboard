const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;
const serviceName = process.env.SERVICE_NAME || 'Attendance System';
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
      <h1>Attendance System</h1>
      <p>Use this service to view and record student attendance.</p>
      <ul>
        <li><a href="/attendance">Attendance API</a></li>
        <li><a href="/health">Health Check</a></li>
      </ul>
    </main>
  `);
});

app.get('/attendance', async (_request, response) => {
  const result = await pool.query(`
    SELECT a.id, s.name AS student_name, a.class_name, a.status, a.attendance_date
    FROM attendance a
    JOIN students s ON s.id = a.student_id
    ORDER BY a.attendance_date DESC, a.id
  `);
  response.json(result.rows);
});

app.post('/attendance', async (request, response) => {
  const { studentId, className, status } = request.body;

  if (!studentId || !className || !['present', 'absent'].includes(status)) {
    return response.status(400).json({
      message: 'Send studentId, className, and status as present or absent.'
    });
  }

  const result = await pool.query(
    `INSERT INTO attendance (student_id, class_name, status)
     VALUES ($1, $2, $3)
     RETURNING id, student_id, class_name, status, attendance_date`,
    [studentId, className, status]
  );

  response.status(201).json(result.rows[0]);
});

app.listen(port, () => {
  console.log(`${serviceName} listening on port ${port}`);
});
