import { pool } from './db.js';

const taskFields = `
  id,
  title,
  description,
  status,
  priority,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export async function createTask({ title, description = null, status = 'pending', priority = 'normal' }) {
  const result = await pool.query(
    `INSERT INTO tasks (title, description, status, priority)
     VALUES ($1, $2, $3, $4)
     RETURNING ${taskFields}`,
    [title, description, status, priority]
  );

  return result.rows[0];
}

const sortColumns = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  title: 'title',
  status: 'status',
  priority: 'priority'
};

export async function listTasks({ status, priority, search, sort = 'createdAt', order = 'desc' } = {}) {
  const whereClauses = [];
  const values = [];

  if (status) {
    values.push(status);
    whereClauses.push(`status = $${values.length}`);
  }

  if (priority) {
    values.push(priority);
    whereClauses.push(`priority = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    whereClauses.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const sortColumn = sortColumns[sort] ?? sortColumns.createdAt;
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  const result = await pool.query(
    `SELECT ${taskFields}
     FROM tasks
     ${whereSql}
     ORDER BY ${sortColumn} ${sortOrder}`,
    values
  );

  return result.rows;
}

export async function findTaskById(id) {
  const result = await pool.query(
    `SELECT ${taskFields}
     FROM tasks
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function updateTask(id, fields) {
  const allowedFields = ['title', 'description', 'status', 'priority'];
  const entries = Object.entries(fields).filter(([key]) => allowedFields.includes(key));

  if (entries.length === 0) {
    return findTaskById(id);
  }

  const setClauses = entries.map(([key], index) => `${key} = $${index + 2}`);
  const values = entries.map(([, value]) => value);

  const result = await pool.query(
    `UPDATE tasks
     SET ${setClauses.join(', ')}, updated_at = NOW()
     WHERE id = $1
     RETURNING ${taskFields}`,
    [id, ...values]
  );

  return result.rows[0] ?? null;
}

export async function deleteTask(id) {
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1 RETURNING id',
    [id]
  );

  return result.rowCount > 0;
}
