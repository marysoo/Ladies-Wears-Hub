import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, getDocFromServer, doc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized with project:", firebaseConfig.projectId);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  throw error;
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

async function testConnection() {
  try {
    // Attempt to reach the server
    await getDocFromServer(doc(db, '_internal_', 'connection_test'));
    console.log("Firestore connection test: reached server successfully");
  } catch (error: any) {
    if (error?.message?.includes('offline')) {
      console.error("Firestore connection test failed: Client is offline. Check your Firebase config and internet connection.");
    } else if (error?.code === 'permission-denied') {
      console.log("Firestore connection test: reached server, but permission denied (expected).");
    } else {
      console.warn("Firestore connection test result:", error?.message || error);
    }
  }
}

testConnection();
