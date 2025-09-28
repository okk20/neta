// server.js - Express server for SEMS API
const express = require('express');
const cors = require('cors');
const path = require('path');

// For production with MongoDB
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store (fallback for development without DB)
let settings = {
  schoolSettings: {
    schoolName: 'School Examination Management System (SEMS)',
    address: 'Offinso, Ashanti Region, Ghana',
    phone: '+233 24 000 0000',
    email: 'info@oce.edu.gh',
    website: 'www.oce.edu.gh',
    logo: '',
    principalName: 'Dr. Samuel Adjei',
    principalSignature: '',
    headmasterName: '',
    currentTerm: 'Term 1',
    currentYear: '2024',
    motto: 'Knowledge is Power',
    establishedYear: '1995',
    updatedAt: new Date().toISOString(),
  },
  systemSettings: {
    theme: 'black',
  },
};

let users = [
  {
    id: 'ADMIN_001',
    username: 'admin',
    role: 'admin',
    email: 'admin@example.com',
    status: 'active',
    lastLogin: new Date().toISOString(),
  },
];

let students = [
  { id: 'SU-1', name: 'John Mensah', class: 'JHS 1', gender: 'Male' },
  { id: 'SU-2', name: 'Ama Serwaa', class: 'JHS 2', gender: 'Female' },
];

let teachers = [
  { id: 'TU-1', name: 'Mr. Kwame Asare', phone: '+233200000001', email: 'kwame@example.com' },
  { id: 'TU-2', name: 'Mrs. Adwoa Kumah', phone: '+233200000002', email: 'adwoa@example.com' },
];

let subjects = [
  { id: 'SUB-ENG', name: 'English', code: 'ENG' },
  { id: 'SUB-MATH', name: 'Mathematics', code: 'MATH' },
  { id: 'SUB-SCI', name: 'Science', code: 'SCI' },
];

let scores = [
  { id: 'SC-1', studentId: 'SU-1', subjectId: 'SUB-ENG', term: 'Term 1', year: '2024', classScore: 25, examScore: 60 },
  { id: 'SC-2', studentId: 'SU-1', subjectId: 'SUB-MATH', term: 'Term 1', year: '2024', classScore: 28, examScore: 58 },
];

// Connect to MongoDB if URI is provided
let db;
if (process.env.MONGODB_URI) {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  client.connect()
    .then(() => {
      console.log('Connected to MongoDB');
      db = client.db(); // Use default db from connection string
      
      // Initialize collections if they don't exist
      initializeCollections();
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      console.log('Falling back to in-memory storage');
    });
    
  const initializeCollections = async () => {
    try {
      // Check if collections exist, if not create with initial data
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      if (!collectionNames.includes('users')) {
        await db.collection('users').insertMany(users);
      }
      if (!collectionNames.includes('students')) {
        await db.collection('students').insertMany(students);
      }
      if (!collectionNames.includes('teachers')) {
        await db.collection('teachers').insertMany(teachers);
      }
      if (!collectionNames.includes('subjects')) {
        await db.collection('subjects').insertMany(subjects);
      }
      if (!collectionNames.includes('scores')) {
        await db.collection('scores').insertMany(scores);
      }
      if (!collectionNames.includes('settings')) {
        await db.collection('settings').insertOne(settings);
      }
    } catch (err) {
      console.error('Error initializing collections:', err);
    }
  };
}

// In-memory data store (in production, use a real database)
let now = new Date().toISOString();

const settings = {
  schoolSettings: {
    schoolName: 'School Examination Management System (SEMS)',
    address: 'Offinso, Ashanti Region, Ghana',
    phone: '+233 24 000 0000',
    email: 'info@oce.edu.gh',
    website: 'www.oce.edu.gh',
    logo: '',
    principalName: 'Dr. Samuel Adjei',
    principalSignature: '',
    headmasterName: '',
    currentTerm: 'Term 1',
    currentYear: '2024',
    motto: 'Knowledge is Power',
    establishedYear: '1995',
    updatedAt: now,
  },
  systemSettings: {
    theme: 'black',
  },
};

let users = [
  {
    id: 'ADMIN_001',
    username: 'admin',
    role: 'admin',
    email: 'admin@example.com',
    status: 'active',
    lastLogin: now,
  },
];

let students = [
  { id: 'SU-1', name: 'John Mensah', class: 'JHS 1', gender: 'Male' },
  { id: 'SU-2', name: 'Ama Serwaa', class: 'JHS 2', gender: 'Female' },
];

let teachers = [
  { id: 'TU-1', name: 'Mr. Kwame Asare', phone: '+233200000001', email: 'kwame@example.com' },
  { id: 'TU-2', name: 'Mrs. Adwoa Kumah', phone: '+233200000002', email: 'adwoa@example.com' },
];

let subjects = [
  { id: 'SUB-ENG', name: 'English', code: 'ENG' },
  { id: 'SUB-MATH', name: 'Mathematics', code: 'MATH' },
  { id: 'SUB-SCI', name: 'Science', code: 'SCI' },
];

let scores = [
  { id: 'SC-1', studentId: 'SU-1', subjectId: 'SUB-ENG', term: 'Term 1', year: '2024', classScore: 25, examScore: 60 },
  { id: 'SC-2', studentId: 'SU-1', subjectId: 'SUB-MATH', term: 'Term 1', year: '2024', classScore: 28, examScore: 58 },
];

// Helper function to generate ID
function generateId(prefix) {
  // In a real app, you might want to make this more sophisticated
  // For now, we'll use a simple incrementing approach
  return `${prefix}-${Date.now()}`;
}

// API Routes
// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  let user;
  if (db) {
    // Use MongoDB
    user = await db.collection('users').findOne({ username });
  } else {
    // Use in-memory
    user = users.find(u => u.username === username) || users[0];
  }
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  const data = {
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
    phone: user.phone,
    status: user.status || 'active',
    lastLogin: new Date().toISOString(),
  };

  // Fake token
  const token = `demo.${Buffer.from(user.username).toString('base64')}.${Date.now()}`;

  res.json({ success: true, data, token });
});

// Students routes
app.get('/api/students', async (req, res) => {
  try {
    let result;
    if (db) {
      // Use MongoDB
      result = await db.collection('students').find({}).toArray();
    } else {
      // Use in-memory
      result = students;
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  const { name, class: className, gender, photo } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, message: 'name required' });
  }
  
  const newStudent = {
    id: generateId('SU'),
    name,
    class: className,
    gender,
    photo,
  };
  
  try {
    if (db) {
      // Use MongoDB
      await db.collection('students').insertOne(newStudent);
    } else {
      // Use in-memory
      students.push(newStudent);
    }
    res.status(201).json({ success: true, data: newStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    let student;
    if (db) {
      // Use MongoDB
      student = await db.collection('students').findOne({ id: req.params.id });
    } else {
      // Use in-memory
      student = students.find(s => s.id === req.params.id);
    }
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Teachers routes
app.get('/api/teachers', async (req, res) => {
  try {
    let result;
    if (db) {
      // Use MongoDB
      result = await db.collection('teachers').find({}).toArray();
    } else {
      // Use in-memory
      result = teachers;
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/teachers', async (req, res) => {
  const { name, phone, email } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, message: 'name required' });
  }
  
  const newTeacher = {
    id: generateId('TU'),
    name,
    phone,
    email,
  };
  
  try {
    if (db) {
      // Use MongoDB
      await db.collection('teachers').insertOne(newTeacher);
    } else {
      // Use in-memory
      teachers.push(newTeacher);
    }
    res.status(201).json({ success: true, data: newTeacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Subjects routes
app.get('/api/subjects', async (req, res) => {
  try {
    let result;
    if (db) {
      // Use MongoDB
      result = await db.collection('subjects').find({}).toArray();
    } else {
      // Use in-memory
      result = subjects;
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/subjects', async (req, res) => {
  const { name, code } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, message: 'name required' });
  }
  
  const newSubject = {
    id: generateId('SUB'),
    name,
    code,
  };
  
  try {
    if (db) {
      // Use MongoDB
      await db.collection('subjects').insertOne(newSubject);
    } else {
      // Use in-memory
      subjects.push(newSubject);
    }
    res.status(201).json({ success: true, data: newSubject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Scores routes
app.get('/api/scores', async (req, res) => {
  try {
    let result;
    if (db) {
      // Use MongoDB
      result = await db.collection('scores').find({}).toArray();
    } else {
      // Use in-memory
      result = scores;
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/scores', async (req, res) => {
  const { studentId, subjectId, term, year, classScore, examScore } = req.body;
  
  if (!studentId || !subjectId || !term || !year || classScore === undefined || examScore === undefined) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }
  
  const newScore = {
    id: generateId('SC'),
    studentId,
    subjectId,
    term,
    year,
    classScore: parseInt(classScore),
    examScore: parseInt(examScore),
  };
  
  try {
    if (db) {
      // Use MongoDB
      await db.collection('scores').insertOne(newScore);
    } else {
      // Use in-memory
      scores.push(newScore);
    }
    res.status(201).json({ success: true, data: newScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Settings routes
app.get('/api/settings/:key?', async (req, res) => {
  try {
    const key = req.params.key;
    if (key) {
      if (db) {
        // Use MongoDB - get specific settings key
        const settingsDoc = await db.collection('settings').findOne({});
        res.json({ success: true, data: settingsDoc ? settingsDoc[key] : {} });
      } else {
        // Use in-memory
        res.json({ success: true, data: settings[key] || {} });
      }
    } else {
      if (db) {
        // Use MongoDB - get all settings
        const settingsDoc = await db.collection('settings').findOne({});
        res.json({ success: true, data: settingsDoc || settings });
      } else {
        // Use in-memory
        res.json({ success: true, data: settings });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve static files from the dist directory (for production)
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`MongoDB connection: ${process.env.MONGODB_URI ? 'Enabled' : 'Disabled (using in-memory)'}`);
});