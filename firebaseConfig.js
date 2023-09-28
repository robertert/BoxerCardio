// Import the functions you need from the SDKs you need
import { getApp, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
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
  measurementId: "G-N91VM3FH78",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const auth = getAuth(FIREBASE_APP);
export const db = getFirestore(FIREBASE_APP);
// export const functions = getFunctions(FIREBASE_APP);
export const functions = getFunctions(getApp());
export const storage = getStorage(FIREBASE_APP);

export async function post(funcName, params) {
  try {
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    let func = httpsCallable(functions, "addNewScore");
    let result = await func(params);
    console.log(result);
    return result.data;
  } catch (e) {
    console.log(e);
  }
}
