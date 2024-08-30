import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAgAusN2iwgoC3lKurAJmLwQhMjyQoJoKo",
  authDomain: "pdf-chatting-wz-ai.firebaseapp.com",
  projectId: "pdf-chatting-wz-ai",
  storageBucket: "pdf-chatting-wz-ai.appspot.com",
  messagingSenderId: "489269095",
  appId: "1:489269095:web:b0d07d43da001f694031c2",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
