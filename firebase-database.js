// Firebase Firestore Database Module
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from './firebase-init.js';

// Generic CRUD operations
export const createDocument = async (collectionName, data, id = null) => {
  try {
    const dataWithTimestamp = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    if (id) {
      await setDoc(doc(db, collectionName, id), dataWithTimestamp);
      return { success: true, id };
    } else {
      const docRef = await addDoc(collection(db, collectionName), dataWithTimestamp);
      return { success: true, id: docRef.id };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Document not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateDocument = async (collectionName, id, data) => {
  try {
    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(doc(db, collectionName, id), dataWithTimestamp);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteDocument = async (collectionName, id) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCollection = async (collectionName, constraints = []) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: documents };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// CRM-specific operations
export const createContact = async (contactData) => {
  return createDocument('contacts', contactData);
};

export const getContact = async (contactId) => {
  return getDocument('contacts', contactId);
};

export const updateContact = async (contactId, contactData) => {
  return updateDocument('contacts', contactId, contactData);
};

export const deleteContact = async (contactId) => {
  return deleteDocument('contacts', contactId);
};

export const getContactsByUser = async (userId) => {
  const constraints = [where('userId', '==', userId), orderBy('createdAt', 'desc')];
  return getCollection('contacts', constraints);
};

export const createActivity = async (activityData) => {
  return createDocument('activities', activityData);
};

export const getActivitiesByContact = async (contactId) => {
  const constraints = [where('contactId', '==', contactId), orderBy('createdAt', 'desc')];
  return getCollection('activities', constraints);
};

export const createDeal = async (dealData) => {
  return createDocument('deals', dealData);
};

export const getDealsByUser = async (userId) => {
  const constraints = [where('userId', '==', userId), orderBy('createdAt', 'desc')];
  return getCollection('deals', constraints);
};

// Lender operations
export const createLender = async (lenderData) => {
  return createDocument('lenders', lenderData);
};

export const getLender = async (lenderId) => {
  return getDocument('lenders', lenderId);
};

export const updateLender = async (lenderId, lenderData) => {
  return updateDocument('lenders', lenderId, lenderData);
};

export const deleteLender = async (lenderId) => {
  return deleteDocument('lenders', lenderId);
};

export const getAllLenders = async () => {
  const constraints = [orderBy('lenderName', 'asc')];
  return getCollection('lenders', constraints);
};

export const getActiveLenders = async () => {
  const constraints = [where('activeStatus', '==', 'Active'), orderBy('lenderName', 'asc')];
  return getCollection('lenders', constraints);
};

export const getLendersByType = async (lenderType) => {
  const constraints = [where('lenderType', '==', lenderType), orderBy('lenderName', 'asc')];
  return getCollection('lenders', constraints);
};

// Real-time listeners
export const listenToDocument = (collectionName, id, callback) => {
  const docRef = doc(db, collectionName, id);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

export const listenToCollection = (collectionName, constraints, callback) => {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, ...constraints);
  return onSnapshot(q, (querySnapshot) => {
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(documents);
  });
};

// Array operations
export const addToArray = async (collectionName, id, field, value) => {
  return updateDocument(collectionName, id, {
    [field]: arrayUnion(value)
  });
};

export const removeFromArray = async (collectionName, id, field, value) => {
  return updateDocument(collectionName, id, {
    [field]: arrayRemove(value)
  });
};

// Counter operations
export const incrementField = async (collectionName, id, field, amount = 1) => {
  return updateDocument(collectionName, id, {
    [field]: increment(amount)
  });
};

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    getCollection,
    createContact,
    getContact,
    updateContact,
    deleteContact,
    getContactsByUser,
    createActivity,
    getActivitiesByContact,
    createDeal,
    getDealsByUser,
    createLender,
    getLender,
    updateLender,
    deleteLender,
    getAllLenders,
    getActiveLenders,
    getLendersByType,
    listenToDocument,
    listenToCollection,
    addToArray,
    removeFromArray,
    incrementField
  };
}
