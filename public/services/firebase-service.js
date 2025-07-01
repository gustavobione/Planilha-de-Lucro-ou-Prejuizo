// Import necessary functions from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, collection, addDoc, onSnapshot, deleteDoc, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase Configuration ---
// These variables are provided by the environment.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Handles user authentication, signing in with a custom token if available,
 * otherwise signing in anonymously.
 * @returns {Promise<void>}
 */
export async function handleAuthentication() {
    if (initialAuthToken) {
        try {
            await signInWithCustomToken(auth, initialAuthToken);
        } catch (error) {
            console.error("Custom token sign-in failed, falling back to anonymous:", error);
            await signInAnonymously(auth);
        }
    } else {
        await signInAnonymously(auth);
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
    const q = query(collection(db, `artifacts/${appId}/users/${userId}/transactions`));
    return onSnapshot(q, (querySnapshot) => {
        const transactions = [];
        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        callback(transactions);
    }, (error) => {
        console.error("Error fetching data with onSnapshot: ", error);
        // You could pass this error to the UI via the callback if needed
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
    const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/transactions`);
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
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/transactions`, transactionId);
    return deleteDoc(docRef);
}
