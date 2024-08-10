// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmn9RHhMV-S8Ma2n9SD1slladi-tPHqyY",
  authDomain: "inventory-management-1c5f9.firebaseapp.com",
  projectId: "inventory-management-1c5f9",
  storageBucket: "inventory-management-1c5f9.appspot.com",
  messagingSenderId: "287159184533",
  appId: "1:287159184533:web:97c7348e736a0a2796ff9c",
  measurementId: "G-8W5YCGTP48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {firestore}