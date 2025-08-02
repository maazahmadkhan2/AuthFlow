#!/usr/bin/env node

/**
 * MySQL Database Setup Script
 * This script creates the necessary database and tables for the AuthFlow project
 */

import mysql from 'mysql2/promise';
import { config } from 'dotenv';

// Load environment variables
config();

const DEFAULT_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const DATABASE_NAME = process.env.DB_NAME || 'authflow';

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔗 Connecting to MySQL server...');
    
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection(DEFAULT_CONFIG);
    
    console.log('✅ Connected to MySQL server successfully');
    
    // Create database if it doesn't exist
    console.log(`📊 Creating database '${DATABASE_NAME}' if it doesn't exist...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${DATABASE_NAME}\``);
    
    // Use the database
    await connection.execute(`USE \`${DATABASE_NAME}\``);
    
    console.log('📋 Creating tables...');
    
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
    
    // Create posts table (example)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        user_id INT NOT NULL,
        published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ All tables created successfully');
    
    // Show created tables
    const [tables] = await connection.execute(`SHOW TABLES`);
    console.log('📋 Created tables:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nYou can now run:');
    console.log('   npm run dev        # Start the application');
    console.log('   npm run db:push    # Sync schema with Drizzle');
    
  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Make sure MySQL server is running');
      console.log('   2. Check your connection settings in .env file');
      console.log('   3. Verify MySQL is listening on port 3306');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupDatabase();