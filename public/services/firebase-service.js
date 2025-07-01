// Import necessary functions from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, collection, addDoc, onSnapshot, deleteDoc, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase Configuration ---
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkSmVXOPqu7lo078u0CRokr9VEo5uoMyI",
  authDomain: "planilha-de-lucro-ou-prejuizo.firebaseapp.com",
  projectId: "planilha-de-lucro-ou-prejuizo",
  storageBucket: "planilha-de-lucro-ou-prejuizo.firebasestorage.app",
  messagingSenderId: "675580770040",
  appId: "1:675580770040:web:d31bff29e2d48d752bad0d"
};

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Handles user authentication by signing in anonymously.
 * @returns {Promise<void>}
 */
export async function handleAuthentication() {
    try {
        await signInAnonymously(auth);
    } catch (error) {
        console.error("Anonymous sign-in failed:", error);
    }
}

/**
 * Sets up a listener for authentication state changes.
 * @param {Function} callback - The function to call when the auth state changes.
 * @returns {import("firebase/auth").Unsubscribe}
 */
export function onAuth(callback) {
    return onAuthStateChanged(auth, callback);
}

/**
 * Sets up a real-time listener for transaction data in Firestore.
 * @param {string} userId - The ID of the current user.
 * @param {Function} callback - The function to call with the transactions data.
 * @returns {import("firebase/firestore").Unsubscribe}
 */
export function listenToTransactions(userId, callback) {
    // CORREÇÃO: Removida a variável "appId" do caminho.
    const collectionPath = `users/${userId}/transactions`;
    const q = query(collection(db, collectionPath));
    return onSnapshot(q, (querySnapshot) => {
        const transactions = [];
        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        callback(transactions);
    }, (error) => {
        console.error("Error fetching data with onSnapshot: ", error);
        callback([], error); 
    });
}

/**
 * Adds a new transaction document to Firestore.
 * @param {string} userId - The ID of the current user.
 * @param {object} transactionData - The data for the new transaction.
 * @returns {Promise<import("firebase/firestore").DocumentReference>}
 */
export function addTransaction(userId, transactionData) {
    // CORREÇÃO: Removida a variável "appId" do caminho.
    const collectionPath = `users/${userId}/transactions`;
    const collectionRef = collection(db, collectionPath);
    return addDoc(collectionRef, {
        ...transactionData,
        createdAt: serverTimestamp()
    });
}

/**
 * Deletes a transaction document from Firestore.
 * @param {string} userId - The ID of the current user.
 * @param {string} transactionId - The ID of the transaction to delete.
 * @returns {Promise<void>}
 */
export function deleteTransaction(userId, transactionId) {
    // CORREÇÃO: Removida a variável "appId" do caminho.
    const docPath = `users/${userId}/transactions/${transactionId}`;
    const docRef = doc(db, docPath);
    return deleteDoc(docRef);
}
