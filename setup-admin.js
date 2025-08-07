// Setup Default Admin - Run this script to create the default admin user
import { createDefaultAdmin } from './client/src/lib/firebase.js';

console.log('Setting up default admin user...');

createDefaultAdmin()
  .then((created) => {
    if (created) {
      console.log('✅ Default admin user created successfully!');
      console.log('');
      console.log('📧 Email: admin@system.local');
      console.log('🔑 This is a database-only admin. Firebase Auth login not required.');
      console.log('🎯 This admin can approve and manage all other users.');
    } else {
      console.log('ℹ️  Default admin already exists.');
    }
  })
  .catch((error) => {
    console.error('❌ Error setting up default admin:', error);
  });