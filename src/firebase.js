import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyASvbp3hiXAyrzKignPDCBqaz8F_NHoe1Y',
  authDomain: 'metro-universe.firebaseapp.com',
  projectId: 'metro-universe',
  storageBucket: 'metro-universe.firebasestorage.app',
  messagingSenderId: '785210369295',
  appId: '1:785210369295:web:3ef63e28c9f6718df3ca7a',
  measurementId: 'G-MD7XZ8W32B',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Analytics only runs in supported browser environments
export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null,
)
