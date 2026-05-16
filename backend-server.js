// Firebase Backend API Server
import express from 'express';
import cors from 'cors';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCimbhjhdMHXZKbbVclwUFWF2O1eyW6c0U",
  authDomain: "fscrm-2b076.firebaseapp.com",
  projectId: "fscrm-2b076",
  storageBucket: "fscrm-2b076.firebasestorage.app",
  messagingSenderId: "40976570212",
  appId: "1:40976570212:web:ab25edb9c4b7ac42b84c71",
  measurementId: "G-BCREVZ0PNL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Express app
const server = express();
const PORT = process.env.PORT || 3000;

// Middleware
server.use(cors());
server.use(express.json());
server.use(express.static('.'));
server.use(express.static('files (6)'));

// Serve CRM HTML as default
server.get('/', (req, res) => {
  res.sendFile('crm.html', { root: 'files (6)' });
});

// Helper function to verify Firebase ID token
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Authentication endpoints
server.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName) {
      await userCredential.user.updateProfile({ displayName });
    }

    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName,
      createdAt: serverTimestamp(),
      role: 'user'
    });

    res.json({ 
      success: true, 
      user: { 
        uid: userCredential.user.uid, 
        email: userCredential.user.email,
        displayName: userCredential.user.displayName 
      } 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

server.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    res.json({ 
      success: true, 
      token,
      user: { 
        uid: userCredential.user.uid, 
        email: userCredential.user.email,
        displayName: userCredential.user.displayName 
      } 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

server.post('/api/auth/logout', verifyToken, async (req, res) => {
  try {
    await signOut(auth);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// CRUD endpoints for contacts
server.get('/api/contacts', verifyToken, async (req, res) => {
  try {
    const q = query(
      collection(db, 'contacts'),
      where('userId', '==', req.user.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const contacts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

server.get('/api/contacts/:id', verifyToken, async (req, res) => {
  try {
    const docRef = doc(db, 'contacts', req.params.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const contact = docSnap.data();
      if (contact.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Access denied' });
      }
      res.json({ success: true, data: { id: docSnap.id, ...contact } });
    } else {
      res.status(404).json({ success: false, error: 'Contact not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

server.post('/api/contacts', verifyToken, async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      userId: req.user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'contacts'), contactData);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

server.put('/api/contacts/:id', verifyToken, async (req, res) => {
  try {
    const docRef = doc(db, 'contacts', req.params.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const contact = docSnap.data();
      if (contact.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      await updateDoc(docRef, {
        ...req.body,
        updatedAt: serverTimestamp()
      });
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Contact not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

server.delete('/api/contacts/:id', verifyToken, async (req, res) => {
  try {
    const docRef = doc(db, 'contacts', req.params.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const contact = docSnap.data();
      if (contact.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      await deleteDoc(docRef);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Contact not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CRUD endpoints for leads
server.get('/api/leads', verifyToken, async (req, res) => {
  try {
    const q = query(
      collection(db, 'leads'),
      where('userId', '==', req.user.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const leads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

server.post('/api/leads', verifyToken, async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      userId: req.user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'leads'), leadData);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

server.put('/api/leads/:id', verifyToken, async (req, res) => {
  try {
    const docRef = doc(db, 'leads', req.params.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const lead = docSnap.data();
      if (lead.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      await updateDoc(docRef, {
        ...req.body,
        updatedAt: serverTimestamp()
      });
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

server.delete('/api/leads/:id', verifyToken, async (req, res) => {
  try {
    const docRef = doc(db, 'leads', req.params.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const lead = docSnap.data();
      if (lead.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      await deleteDoc(docRef);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CRUD endpoints for deals
server.get('/api/deals', verifyToken, async (req, res) => {
  try {
    const q = query(
      collection(db, 'deals'),
      where('userId', '==', req.user.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const deals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: deals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

server.post('/api/deals', verifyToken, async (req, res) => {
  try {
    const dealData = {
      ...req.body,
      userId: req.user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'deals'), dealData);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

server.put('/api/deals/:id', verifyToken, async (req, res) => {
  try {
    const docRef = doc(db, 'deals', req.params.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const deal = docSnap.data();
      if (deal.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      await updateDoc(docRef, {
        ...req.body,
        updatedAt: serverTimestamp()
      });
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Deal not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dashboard stats endpoint
server.get('/api/dashboard/stats', verifyToken, async (req, res) => {
  try {
    // Get leads
    const leadsQuery = query(
      collection(db, 'leads'),
      where('userId', '==', req.user.uid)
    );
    const leadsSnapshot = await getDocs(leadsQuery);
    const leads = leadsSnapshot.docs.map(doc => doc.data());
    
    // Get deals
    const dealsQuery = query(
      collection(db, 'deals'),
      where('userId', '==', req.user.uid)
    );
    const dealsSnapshot = await getDocs(dealsQuery);
    const deals = dealsSnapshot.docs.map(doc => doc.data());
    
    // Get tasks
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', req.user.uid)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map(doc => doc.data());
    
    // Calculate stats
    const stats = {
      leads: {
        total: leads.length,
        hot: leads.filter(l => l.status === 'hot').length,
        warm: leads.filter(l => l.status === 'warm').length,
        cold: leads.filter(l => l.status === 'cold').length
      },
      deals: {
        total: deals.length,
        open: deals.filter(d => !['closed-won', 'closed-lost'].includes(d.stage)).length,
        won: deals.filter(d => d.stage === 'closed-won').length,
        totalValue: deals.reduce((sum, d) => sum + (d.value || 0), 0)
      },
      tasks: {
        pending: tasks.filter(t => !t.completed).length,
        completed: tasks.filter(t => t.completed).length
      }
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Firebase Backend Server running on port ${PORT}`);
});
