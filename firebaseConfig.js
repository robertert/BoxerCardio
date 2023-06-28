// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth} from 'firebase/auth'
import {getFirestore} from '@firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPnxi4sLB9LqFIntoFVH0Dzcz-vLCDyTs",
  authDomain: "boxerapp-beb5c.firebaseapp.com",
  projectId: "boxerapp-beb5c",
  storageBucket: "boxerapp-beb5c.appspot.com",
  messagingSenderId: "978376103925",
  appId: "1:978376103925:web:d21b53861e25f54bd632bc",
  measurementId: "G-N91VM3FH78"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const auth = getAuth(FIREBASE_APP);
export const db = getFirestore(FIREBASE_APP);