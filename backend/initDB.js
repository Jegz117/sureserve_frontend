import fs from 'fs';
import db from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDB() {
  try {
    const connection = await db.getConnection();
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    
    // Split by semicolon, filter out empty statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let statement of statements) {
      await connection.query(statement);
    }
    
    console.log('Database initialized successfully from init.sql!');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDB();
