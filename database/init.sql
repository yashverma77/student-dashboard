CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  course VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent')),
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO students (name, email, course)
VALUES
  ('Aarav Sharma', 'aarav.sharma@campus.edu', 'Computer Science'),
  ('Meera Nair', 'meera.nair@campus.edu', 'Electronics'),
  ('Kabir Singh', 'kabir.singh@campus.edu', 'Business Analytics')
ON CONFLICT (email) DO NOTHING;

INSERT INTO attendance (student_id, class_name, status, attendance_date)
SELECT id, 'Docker Fundamentals', 'present', CURRENT_DATE
FROM students
ON CONFLICT DO NOTHING;

INSERT INTO notifications (title, message)
VALUES
  ('Welcome', 'Smart Campus services are running successfully.'),
  ('Docker Deployment', 'All services are connected through the campus Docker network.')
ON CONFLICT DO NOTHING;
