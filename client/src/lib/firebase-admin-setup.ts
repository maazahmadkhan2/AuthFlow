import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from './firebase';

// Create Firebase Admin User (both Auth and Firestore)
export const createFirebaseAdmin = async () => {
  try {
    console.log('Creating Firebase admin user...');
    
    const adminEmail = 'admin@system.local';
    const adminPassword = 'AdminPass123!';
    
    // Check if admin already exists in Firestore
    const adminDoc = await getDoc(doc(db, 'users', 'firebase-admin-001'));
    
    if (adminDoc.exists()) {
      console.log('Firebase admin already exists in Firestore');
      return { success: true, message: 'Admin already exists', exists: true };
    }

    try {
      // Try to create new Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: 'System Administrator'
      });
      
      // Create admin user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: adminEmail,
        firstName: 'System',
        lastName: 'Administrator',
        displayName: 'System Administrator',
        role: 'admin',
        emailVerified: true,
        isFirebaseAdmin: true,
        permissions: ['manage_users', 'manage_roles', 'view_all_data', 'manage_system', 'approve_users'],
        isActive: true,
        isApproved: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      // Also create a reference document with known ID for easy lookup
      await setDoc(doc(db, 'users', 'firebase-admin-001'), {
        email: adminEmail,
        firstName: 'System',
        lastName: 'Administrator',
        displayName: 'System Administrator',
        role: 'admin',
        emailVerified: true,
        isFirebaseAdmin: true,
        firebaseUid: user.uid,
        permissions: ['manage_users', 'manage_roles', 'view_all_data', 'manage_system', 'approve_users'],
        isActive: true,
        isApproved: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log('✅ Firebase admin created successfully!');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('🆔 Firebase UID:', user.uid);
      
      return { 
        success: true, 
        message: 'Firebase admin created successfully',
        uid: user.uid,
        email: adminEmail
      };
      
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('Firebase Auth user already exists, checking for sign-in...');
        
        try {
          // Try to sign in with existing credentials
          const signInResult = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          const existingUser = signInResult.user;
          
          // Create/update Firestore document for existing Firebase user
          await setDoc(doc(db, 'users', existingUser.uid), {
            email: adminEmail,
            firstName: 'System',
            lastName: 'Administrator',
            displayName: 'System Administrator',
            role: 'admin',
            emailVerified: true,
            isFirebaseAdmin: true,
            permissions: ['manage_users', 'manage_roles', 'view_all_data', 'manage_system', 'approve_users'],
            isActive: true,
            isApproved: true,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          
          // Create reference document
          await setDoc(doc(db, 'users', 'firebase-admin-001'), {
            email: adminEmail,
            firstName: 'System',
            lastName: 'Administrator',
            displayName: 'System Administrator',
            role: 'admin',
            emailVerified: true,
            isFirebaseAdmin: true,
            firebaseUid: existingUser.uid,
            permissions: ['manage_users', 'manage_roles', 'view_all_data', 'manage_system', 'approve_users'],
            isActive: true,
            isApproved: true,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          
          console.log('✅ Existing Firebase admin linked to Firestore!');
          return { 
            success: true, 
            message: 'Existing Firebase admin linked successfully',
            uid: existingUser.uid,
            email: adminEmail
          };
          
        } catch (signInError) {
          console.error('❌ Failed to sign in with existing credentials:', signInError);
          return { 
            success: false, 
            error: 'Admin email exists but password does not match. Please reset the password or use correct credentials.' 
          };
        }
      } else {
        throw authError;
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating Firebase admin:', error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
};

// Sign in as Firebase Admin
export const signInAsFirebaseAdmin = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Verify admin role in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('Admin user data not found in Firestore');
    }
    
    const userData = userDoc.data();
    
    if (userData.role !== 'admin') {
      throw new Error('User does not have admin privileges');
    }
    
    console.log('✅ Firebase admin signed in successfully!');
    return { 
      success: true, 
      user, 
      userData,
      message: 'Admin signed in successfully' 
    };
    
  } catch (error) {
    console.error('❌ Error signing in as Firebase admin:', error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
};

// Auto-setup admin if in browser
export const autoSetupFirebaseAdmin = async () => {
  if (typeof window !== 'undefined') {
    try {
      const result = await createFirebaseAdmin();
      return result;
    } catch (error) {
      console.error('Auto-setup failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }
  return { success: false, error: 'Not in browser environment' };
};