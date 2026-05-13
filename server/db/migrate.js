import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const schema = await readFile(join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('Migration executada com sucesso.');
} catch (error) {
  console.error('Erro ao executar migration:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
