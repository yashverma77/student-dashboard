const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3003;
const serviceName = process.env.SERVICE_NAME || 'Admin Dashboard';
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

app.get('/', async (_request, response) => {
  const stats = await loadStats();

  response.type('html').send(`
    <main style="font-family:Arial,sans-serif;max-width:860px;margin:40px auto;line-height:1.5">
      <h1>Smart Campus Admin Dashboard</h1>
      <section style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">
        <article style="border:1px solid #ddd;padding:16px;border-radius:8px">
          <strong>Total Students</strong>
          <p style="font-size:32px;margin:8px 0">${stats.totalStudents}</p>
        </article>
        <article style="border:1px solid #ddd;padding:16px;border-radius:8px">
          <strong>Attendance Records</strong>
          <p style="font-size:32px;margin:8px 0">${stats.totalAttendance}</p>
        </article>
        <article style="border:1px solid #ddd;padding:16px;border-radius:8px">
          <strong>Notifications</strong>
          <p style="font-size:32px;margin:8px 0">${stats.totalNotifications}</p>
        </article>
      </section>
      <h2>Service Links</h2>
      <ul>
        <li><a href="/stats">Dashboard Stats API</a></li>
        <li>Student API inside Docker: ${process.env.STUDENT_API_URL}</li>
        <li>Attendance API inside Docker: ${process.env.ATTENDANCE_API_URL}</li>
        <li>Notification API inside Docker: ${process.env.NOTIFICATION_API_URL}</li>
      </ul>
    </main>
  `);
});

app.get('/stats', async (_request, response) => {
  response.json({
    service: serviceName,
    ...(await loadStats())
  });
});

async function loadStats() {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM students) AS total_students,
      (SELECT COUNT(*)::int FROM attendance) AS total_attendance,
      (SELECT COUNT(*)::int FROM notifications) AS total_notifications
  `);

  return {
    totalStudents: result.rows[0].total_students,
    totalAttendance: result.rows[0].total_attendance,
    totalNotifications: result.rows[0].total_notifications
  };
}

app.listen(port, () => {
  console.log(`${serviceName} listening on port ${port}`);
});
