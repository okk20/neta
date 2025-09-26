import { http, HttpResponse } from 'msw';

// Mock data
const mockUsers = [
  {
    id: 'ADMIN_001',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    email: 'admin@sems.edu.gh',
    phone: '+233 24 000 0000',
    status: 'active',
    lastLogin: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockStudents = [
  {
    studentId: 'SU-123456789',
    name: 'John Doe',
    class: 'Grade 10A',
    dateOfBirth: '2008-05-15',
    gender: 'Male',
    guardianName: 'Jane Doe',
    guardianPhone: '+233 123 456 789',
    address: 'Accra, Ghana',
    admissionDate: '2020-09-01',
    status: 'active'
  }
];

const mockTeachers = [
  {
    teacherId: 'TE-123456789',
    name: 'Teacher One',
    title: 'Mr.',
    email: 'teacher1@sems.edu.gh',
    phone: '+233 123 456 789',
    address: 'Accra, Ghana',
    qualification: 'B.Ed',
    specialization: 'Mathematics',
    subjects: ['Mathematics', 'Science'],
    employmentDate: '2015-08-15',
    status: 'active'
  }
];

const mockSubjects = [
  {
    subjectId: 'SJ-123456789',
    name: 'Mathematics',
    code: 'MATH101',
    description: 'Basic Mathematics',
    category: 'STEM',
    creditHours: 3,
    isCore: true
  }
];

const mockScores = [
  {
    studentId: 'SU-123456789',
    subjectId: 'SJ-123456789',
    term: 'First Term',
    year: '2024',
    classScore: 85,
    examScore: 80,
    totalScore: 165,
    grade: 'A',
    teacherId: 'TE-123456789'
  }
];

export const handlers = [
  // Auth API
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = await request.json();
    
    if (username === 'admin' && password === 'admin123') {
      // Find the user to return the complete user object
      const user = mockUsers.find(u => u.username === username && u.password === password);
      if (user) {
        return HttpResponse.json({
          success: true,
          message: 'Login successful',
          data: {
            _id: user._id || user.id,
            id: user.id || user._id,
            username: user.username,
            role: user.role,
            studentId: user.studentId || null,
            teacherId: user.teacherId || null,
            email: user.email,
            phone: user.phone,
            status: user.status,
            lastLogin: user.lastLogin,
          },
          token: 'mock-jwt-token'
        });
      }
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Invalid credentials',
      data: null  // Ensure data field exists even for failed responses
    }, { status: 401 });
  }),

  http.post('/api/auth/student/login', async ({ request }) => {
    const { studentId, password } = await request.json();
    
    if (studentId && password) {
      const student = mockStudents.find(s => s.studentId === studentId);
      if (student) {
        return HttpResponse.json({
          success: true,
          message: 'Student login successful',
          data: {
            _id: student._id,
            id: student.id || student.studentId,
            username: student.name,
            role: 'student',
            studentId: student.studentId,
            email: student.email || '',
            phone: student.phone || '',
            status: student.status,
          },
          token: 'mock-jwt-token'
        });
      }
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Invalid student credentials'
    }, { status: 401 });
  }),

  http.post('/api/auth/teacher/login', async ({ request }) => {
    const { teacherId, phoneNumber } = await request.json();
    
    if (teacherId && phoneNumber) {
      const teacher = mockTeachers.find(t => t.teacherId === teacherId);
      if (teacher) {
        return HttpResponse.json({
          success: true,
          message: 'Teacher login successful',
          data: {
            _id: teacher._id,
            id: teacher.id || teacher.teacherId,
            username: teacher.name,
            role: 'teacher',
            teacherId: teacher.teacherId,
            email: teacher.email,
            phone: teacher.phone,
            status: teacher.status,
          },
          token: 'mock-jwt-token'
        });
      }
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Invalid teacher credentials'
    }, { status: 401 });
  }),

  // Users API
  http.get('/api/users', () => {
    return HttpResponse.json({
      success: true,
      data: mockUsers
    });
  }),

  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUsers.find(u => u.id === id);
    
    if (user) {
      return HttpResponse.json({
        success: true,
        data: user
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'User not found'
    }, { status: 404 });
  }),

  http.post('/api/users', async ({ request }) => {
    const userData = await request.json();
    const newUser = {
      ...userData,
      id: `USER-${Date.now()}` // Simple ID generation for mock
    };
    mockUsers.push(newUser);
    
    return HttpResponse.json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  }),

  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates, updatedAt: new Date().toISOString() };
      
      return HttpResponse.json({
        success: true,
        message: 'User updated successfully',
        data: mockUsers[userIndex]
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'User not found'
    }, { status: 404 });
  }),

  http.delete('/api/users/:id', ({ params }) => {
    const { id } = params;
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex !== -1) {
      mockUsers.splice(userIndex, 1);
      
      return HttpResponse.json({
        success: true,
        message: 'User deleted successfully'
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'User not found'
    }, { status: 404 });
  }),

  // Students API
  http.get('/api/students', () => {
    return HttpResponse.json({
      success: true,
      data: mockStudents
    });
  }),

  http.get('/api/students/:id', ({ params }) => {
    const { id } = params;
    const student = mockStudents.find(s => s.studentId === id);
    
    if (student) {
      return HttpResponse.json({
        success: true,
        data: student
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Student not found'
    }, { status: 404 });
  }),

  http.post('/api/students', async ({ request }) => {
    const studentData = await request.json();
    const newStudent = {
      ...studentData,
      studentId: `SU-${Date.now()}` // Simple ID generation for mock
    };
    mockStudents.push(newStudent);
    
    return HttpResponse.json({
      success: true,
      message: 'Student created successfully',
      data: newStudent
    });
  }),

  http.put('/api/students/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    
    const studentIndex = mockStudents.findIndex(s => s.studentId === id);
    if (studentIndex !== -1) {
      mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...updates };
      
      return HttpResponse.json({
        success: true,
        message: 'Student updated successfully',
        data: mockStudents[studentIndex]
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Student not found'
    }, { status: 404 });
  }),

  http.delete('/api/students/:id', ({ params }) => {
    const { id } = params;
    const studentIndex = mockStudents.findIndex(s => s.studentId === id);
    
    if (studentIndex !== -1) {
      mockStudents.splice(studentIndex, 1);
      
      return HttpResponse.json({
        success: true,
        message: 'Student deleted successfully'
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Student not found'
    }, { status: 404 });
  }),

  // Teachers API
  http.get('/api/teachers', () => {
    return HttpResponse.json({
      success: true,
      data: mockTeachers
    });
  }),

  http.get('/api/teachers/:id', ({ params }) => {
    const { id } = params;
    const teacher = mockTeachers.find(t => t.teacherId === id);
    
    if (teacher) {
      return HttpResponse.json({
        success: true,
        data: teacher
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Teacher not found'
    }, { status: 404 });
  }),

  http.post('/api/teachers', async ({ request }) => {
    const teacherData = await request.json();
    const newTeacher = {
      ...teacherData,
      teacherId: `TE-${Date.now()}` // Simple ID generation for mock
    };
    mockTeachers.push(newTeacher);
    
    return HttpResponse.json({
      success: true,
      message: 'Teacher created successfully',
      data: newTeacher
    });
  }),

  http.put('/api/teachers/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    
    const teacherIndex = mockTeachers.findIndex(t => t.teacherId === id);
    if (teacherIndex !== -1) {
      mockTeachers[teacherIndex] = { ...mockTeachers[teacherIndex], ...updates };
      
      return HttpResponse.json({
        success: true,
        message: 'Teacher updated successfully',
        data: mockTeachers[teacherIndex]
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Teacher not found'
    }, { status: 404 });
  }),

  http.delete('/api/teachers/:id', ({ params }) => {
    const { id } = params;
    const teacherIndex = mockTeachers.findIndex(t => t.teacherId === id);
    
    if (teacherIndex !== -1) {
      mockTeachers.splice(teacherIndex, 1);
      
      return HttpResponse.json({
        success: true,
        message: 'Teacher deleted successfully'
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Teacher not found'
    }, { status: 404 });
  }),

  // Subjects API
  http.get('/api/subjects', () => {
    return HttpResponse.json({
      success: true,
      data: mockSubjects
    });
  }),

  http.get('/api/subjects/:id', ({ params }) => {
    const { id } = params;
    const subject = mockSubjects.find(s => s.subjectId === id);
    
    if (subject) {
      return HttpResponse.json({
        success: true,
        data: subject
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Subject not found'
    }, { status: 404 });
  }),

  http.post('/api/subjects', async ({ request }) => {
    const subjectData = await request.json();
    const newSubject = {
      ...subjectData,
      subjectId: `SJ-${Date.now()}` // Simple ID generation for mock
    };
    mockSubjects.push(newSubject);
    
    return HttpResponse.json({
      success: true,
      message: 'Subject created successfully',
      data: newSubject
    });
  }),

  http.put('/api/subjects/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    
    const subjectIndex = mockSubjects.findIndex(s => s.subjectId === id);
    if (subjectIndex !== -1) {
      mockSubjects[subjectIndex] = { ...mockSubjects[subjectIndex], ...updates };
      
      return HttpResponse.json({
        success: true,
        message: 'Subject updated successfully',
        data: mockSubjects[subjectIndex]
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Subject not found'
    }, { status: 404 });
  }),

  http.delete('/api/subjects/:id', ({ params }) => {
    const { id } = params;
    const subjectIndex = mockSubjects.findIndex(s => s.subjectId === id);
    
    if (subjectIndex !== -1) {
      mockSubjects.splice(subjectIndex, 1);
      
      return HttpResponse.json({
        success: true,
        message: 'Subject deleted successfully'
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Subject not found'
    }, { status: 404 });
  }),

  // Scores API
  http.get('/api/scores', () => {
    return HttpResponse.json({
      success: true,
      data: mockScores
    });
  }),

  http.get('/api/scores/:studentId/:term/:year', ({ params }) => {
    const { studentId, term, year } = params;
    const scores = mockScores.filter(s => s.studentId === studentId && s.term === term && s.year === year);
    
    return HttpResponse.json({
      success: true,
      data: scores
    });
  }),

  http.post('/api/scores', async ({ request }) => {
    const scoreData = await request.json();
    const newScore = {
      ...scoreData,
      _id: `SC-${Date.now()}` // Simple ID generation for mock
    };
    mockScores.push(newScore);
    
    return HttpResponse.json({
      success: true,
      message: 'Score created successfully',
      data: newScore
    });
  }),

  http.put('/api/scores/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    
    const scoreIndex = mockScores.findIndex(s => s._id === id);
    if (scoreIndex !== -1) {
      mockScores[scoreIndex] = { ...mockScores[scoreIndex], ...updates };
      
      return HttpResponse.json({
        success: true,
        message: 'Score updated successfully',
        data: mockScores[scoreIndex]
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Score not found'
    }, { status: 404 });
  }),

  http.delete('/api/scores/:id', ({ params }) => {
    const { id } = params;
    const scoreIndex = mockScores.findIndex(s => s._id === id);
    
    if (scoreIndex !== -1) {
      mockScores.splice(scoreIndex, 1);
      
      return HttpResponse.json({
        success: true,
        message: 'Score deleted successfully'
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Score not found'
    }, { status: 404 });
  }),
  
  // Settings API
  http.get('/api/settings/:key', ({ params }) => {
    const { key } = params;
    
    if (key === 'schoolSettings') {
      return HttpResponse.json({
        success: true,
        data: {
          schoolName: 'Sample School',
          address: 'Sample Address, Ghana',
          phone: '+233 123 456 789',
          email: 'info@sample-school.edu.gh',
          website: 'www.sample-school.edu.gh',
          principalName: 'Principal Name',
          currentTerm: 'First Term',
          currentYear: '2024',
          motto: 'Excellence in Education',
          establishedYear: '1990',
        }
      });
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Setting not found'
    }, { status: 404 });
  }),

  http.put('/api/settings/:key', async ({ params, request }) => {
    const { key } = params;
    const value = await request.json();
    
    return HttpResponse.json({
      success: true,
      message: 'Setting updated successfully',
      data: value
    });
  }),
];