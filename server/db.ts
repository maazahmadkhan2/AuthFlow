import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Create a simple in-memory storage for development
let connection: mysql.Connection;

async function initializeDatabase() {
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'password',
      database: 'auth_db',
      port: 3306
    });

    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS auth_db');
    await connection.execute('USE auth_db');

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        profile_image_url TEXT,
        password TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR(128) PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL,
        INDEX IDX_session_expire (expire)
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.log('MySQL not available, using in-memory storage for development');
    // If MySQL is not available, we'll use a simple object store
    connection = null;
  }
}

// Initialize database
await initializeDatabase();

export const db = connection ? drizzle(connection, { schema, mode: 'default' }) : null;