import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

let connection: mysql.Connection | null = null;
let db: ReturnType<typeof drizzle> | null = null;

async function initializeDatabase() {
  try {
    // Try to connect using DATABASE_URL first, then fallback to default settings
    const dbUrl = process.env.DATABASE_URL;
    
    if (dbUrl && dbUrl.startsWith('mysql://')) {
      // Parse MySQL URL: mysql://user:password@host:port/database
      const url = new URL(dbUrl);
      connection = await mysql.createConnection({
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1), // Remove leading '/'
      });
    } else {
      // Fallback to default settings
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'authflow',
      });
    }

    // Test the connection
    await connection.ping();
    
    // Initialize Drizzle
    db = drizzle(connection, { schema, mode: 'default' });
    
    console.log('MySQL database connected successfully');
  } catch (error) {
    console.log('MySQL not available, using in-memory storage for development');
    console.log('Error:', error instanceof Error ? error.message : String(error));
    connection = null;
    db = null;
  }
}

// Initialize database
initializeDatabase();

export { db, connection };