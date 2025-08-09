import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Check if email exists and get sign-in methods
export const checkEmailExists = async (email: string) => {
  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    return {
      exists: signInMethods.length > 0,
      methods: signInMethods,
      hasPassword: signInMethods.includes('password'),
      hasGoogle: signInMethods.includes('google.com')
    };
  } catch (error) {
    console.error("Error checking email:", error);
    return {
      exists: false,
      methods: [],
      hasPassword: false,
      hasGoogle: false
    };
  }
};

// Email/Password Authentication
export const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    // First check if email already exists
    const emailCheck = await checkEmailExists(email);
    
    if (emailCheck.exists) {
      if (emailCheck.hasPassword) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      } else if (emailCheck.hasGoogle) {
        throw new Error('An account with this email exists via Google. Please sign in with Google instead.');
      }
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with name
    await updateProfile(result.user, {
      displayName: `${firstName} ${lastName}`
    });
    
    // Create user document in Firestore with default role (pending approval)
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      emailVerified: result.user.emailVerified,
      profileImageUrl: result.user.photoURL || null,
      role: 'student', // Default role for new users
      permissions: ['view_courses', 'submit_assignments', 'view_grades'], // Default permissions
      isActive: false, // Inactive until approved
      isApproved: false, // Requires admin approval
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    // Send email verification
    await sendEmailVerification(result.user);
    
    return result.user;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email is verified
    if (!result.user.emailVerified) {
      await signOut(auth);
      throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
    }
    
    return result.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Google Authentication
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      const displayName = result.user.displayName || '';
      const [firstName = '', lastName = ''] = displayName.split(' ');
      
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        firstName,
        lastName,
        displayName: result.user.displayName,
        emailVerified: result.user.emailVerified,
        profileImageUrl: result.user.photoURL,
        role: 'student', // Default role for new users
        permissions: ['view_courses', 'submit_assignments', 'view_grades'], // Default permissions
        isActive: false, // Inactive until approved
        isApproved: false, // Requires admin approval
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } else {
      // Update existing user data with Google info if needed
      const userData = userDoc.data();
      const updatedData: any = {
        emailVerified: result.user.emailVerified,
        updatedAt: Timestamp.now(),
      };
      
      // Update profile image if user doesn't have one
      if (!userData.profileImageUrl && result.user.photoURL) {
        updatedData.profileImageUrl = result.user.photoURL;
      }
      
      // Update display name if empty
      if (!userData.displayName && result.user.displayName) {
        updatedData.displayName = result.user.displayName;
        const [firstName = '', lastName = ''] = result.user.displayName.split(' ');
        if (!userData.firstName) updatedData.firstName = firstName;
        if (!userData.lastName) updatedData.lastName = lastName;
      }
      
      await updateDoc(doc(db, 'users', result.user.uid), updatedData);
    }
    
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Password Reset
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

// Email Verification
export const resendEmailVerification = async (user: User) => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error("Error sending email verification:", error);
    throw error;
  }
};

// Password Update
export const updatePassword = async (user: User, currentPassword: string, newPassword: string) => {
  try {
    // Re-authenticate user with current password
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await firebaseUpdatePassword(user, newPassword);
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

// Database Operations
export const getUserData = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

export const updateUserData = async (uid: string, data: any) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

// Posts Operations (example of additional data)
export const createPost = async (uid: string, title: string, content: string) => {
  try {
    await addDoc(collection(db, 'posts'), {
      userId: uid,
      title,
      content,
      published: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getUserPosts = async (uid: string) => {
  try {
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting user posts:", error);
    throw error;
  }
};

// Role Management Functions
export const updateUserRole = async (userId: string, role: string, updatedBy: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Get role permissions
    const rolePermissions = {
      admin: ['manage_users', 'manage_roles', 'view_all_data', 'manage_system'],
      manager: ['manage_coordinators', 'manage_instructors', 'view_reports', 'manage_courses'],
      coordinator: ['manage_instructors', 'manage_students', 'view_course_data'],
      instructor: ['manage_students', 'manage_assignments', 'view_class_data'],
      student: ['view_courses', 'submit_assignments', 'view_grades']
    };

    await updateDoc(userRef, {
      role: role,
      permissions: rolePermissions[role as keyof typeof rolePermissions] || [],
      updatedAt: Timestamp.now(),
      lastUpdatedBy: updatedBy
    });

    // Log role change for audit trail
    await addDoc(collection(db, 'role_changes'), {
      userId,
      previousRole: null, // Could fetch this first if needed
      newRole: role,
      changedBy: updatedBy,
      timestamp: Timestamp.now()
    });

    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(usersQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

export const getUsersByRole = async (role: string) => {
  try {
    const usersQuery = query(
      collection(db, 'users'), 
      where('role', '==', role),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(usersQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
};

export const toggleUserStatus = async (userId: string, isActive: boolean, updatedBy: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      isActive,
      updatedAt: Timestamp.now(),
      lastUpdatedBy: updatedBy
    });

    return true;
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

export const getRoleChangeHistory = async (userId?: string) => {
  try {
    let roleChangesQuery;
    
    if (userId) {
      roleChangesQuery = query(
        collection(db, 'role_changes'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
    } else {
      roleChangesQuery = query(
        collection(db, 'role_changes'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
    }

    const querySnapshot = await getDocs(roleChangesQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting role change history:', error);
    throw error;
  }
};

// Default Admin Creation - Store in Firestore
export const createDefaultAdmin = async () => {
  try {
    const adminId = 'system-admin-001';
    
    // Check if admin already exists in Firestore
    const adminDoc = await getDoc(doc(db, 'users', adminId));
    
    if (adminDoc.exists()) {
      console.log('Default admin already exists in Firestore');
      return false;
    }

    // Create admin user document in Firestore
    await setDoc(doc(db, 'users', adminId), {
      email: 'admin@system.local',
      firstName: 'System',
      lastName: 'Administrator',
      displayName: 'System Administrator',
      role: 'admin',
      status: 'approved',
      emailVerified: true,
      isDefaultAdmin: true,
      permissions: ['manage_users', 'manage_roles', 'view_all_data', 'manage_system', 'approve_users'],
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    console.log('Default admin created successfully in Firestore');
    return true;
  } catch (error) {
    console.error('Error creating default admin:', error);
    throw error;
  }
};

// User Approval System
export const getPendingUsers = async () => {
  try {
    const pendingQuery = query(
      collection(db, 'users'),
      where('isApproved', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(pendingQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting pending users:', error);
    throw error;
  }
};

export const approveUser = async (userId: string, approvedBy: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      isApproved: true,
      isActive: true,
      approvedAt: Timestamp.now(),
      approvedBy: approvedBy,
      updatedAt: Timestamp.now(),
    });

    // Log approval for audit trail
    await addDoc(collection(db, 'user_approvals'), {
      userId,
      approvedBy,
      action: 'approved',
      timestamp: Timestamp.now()
    });

    return true;
  } catch (error) {
    console.error('Error approving user:', error);
    throw error;
  }
};

export const rejectUser = async (userId: string, rejectedBy: string, reason?: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      isApproved: false,
      isActive: false,
      rejectedAt: Timestamp.now(),
      rejectedBy: rejectedBy,
      rejectionReason: reason || 'No reason provided',
      updatedAt: Timestamp.now(),
    });

    // Log rejection for audit trail
    await addDoc(collection(db, 'user_approvals'), {
      userId,
      rejectedBy,
      action: 'rejected',
      reason: reason || 'No reason provided',
      timestamp: Timestamp.now()
    });

    return true;
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
};

export default app;