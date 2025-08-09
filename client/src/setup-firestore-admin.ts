// Setup Firestore Admin - Run this in browser console or component
import { createDefaultAdmin } from './lib/firebase';

export const setupFirestoreAdmin = async () => {
  try {
    console.log('Setting up Firestore admin user...');
    const created = await createDefaultAdmin();
    
    if (created) {
      console.log('✅ Firestore admin created successfully!');
      console.log('📧 Email: admin@system.local');
      console.log('🔑 Password: AdminPass123!');
      console.log('🎯 Admin can now access /admin route');
      return { success: true, message: 'Admin created successfully' };
    } else {
      console.log('ℹ️ Firestore admin already exists.');
      return { success: true, message: 'Admin already exists' };
    }
  } catch (error) {
    console.error('❌ Error setting up Firestore admin:', error);
    return { success: false, error: error.message };
  }
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  setupFirestoreAdmin();
}