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

// Email/Password Authentication
export const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with name
    await updateProfile(result.user, {
      displayName: `${firstName} ${lastName}`
    });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      emailVerified: result.user.emailVerified,
      profileImageUrl: result.user.photoURL || null,
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
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

export default app;