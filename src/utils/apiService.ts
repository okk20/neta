import API_BASE_URL from '../constants/api';

// Check if we're running in Electron
const isElectron = window.electronAPI !== undefined;

// Use Electron API endpoint if running in Electron, otherwise use the imported API_BASE_URL
const BASE_URL = isElectron ? window.electronAPI.getApiEndpoint() : API_BASE_URL;

class ApiService {
  private token: string | null = null;

  constructor() {
    // Initialize token to null
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async apiCall(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Add authorization header if token exists
    if (this.token) {
      defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const config = {
      ...defaultOptions,
      ...options,
    };
    
    try {
      const response = await fetch(url, config);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 200)}...`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      // If it's a network error or parsing error, rethrow with more context
      if (error instanceof TypeError || error.message.includes('Unexpected token')) {
        throw new Error(`Failed to connect to server. Please check your network connection and try again. (${error.message})`);
      }
      throw error;
    }
  }
  
  // Auth API methods
  async login(username, password, role) {
    return this.apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  }
  
  async studentLogin(studentId, password) {
    return this.apiCall('/auth/student/login', {
      method: 'POST',
      body: JSON.stringify({ studentId, password }),
    });
  }
  
  async teacherLogin(teacherId, phoneNumber) {
    return this.apiCall('/auth/teacher/login', {
      method: 'POST',
      body: JSON.stringify({ teacherId, phoneNumber }),
    });
  }
  
  async teacherSignup(inviteToken, username, password, email, phone) {
    return this.apiCall('/auth/teacher/signup', {
      method: 'POST',
      body: JSON.stringify({ inviteToken, username, password, email, phone }),
    });
  }
  
  // Student API methods
  async getStudents() {
    return this.apiCall('/students');
  }
  
  async getStudentById(id) {
    return this.apiCall(`/students/${id}`);
  }
  
  async addStudent(studentData) {
    return this.apiCall('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }
  
  async updateStudent(id, studentData) {
    return this.apiCall(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }
  
  async deleteStudent(id) {
    return this.apiCall(`/students/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Teacher API methods
  async getTeachers() {
    return this.apiCall('/teachers');
  }
  
  async getTeacherById(id) {
    return this.apiCall(`/teachers/${id}`);
  }
  
  async addTeacher(teacherData) {
    return this.apiCall('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  }
  
  async updateTeacher(id, teacherData) {
    return this.apiCall(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData),
    });
  }
  
  async deleteTeacher(id) {
    return this.apiCall(`/teachers/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Subject API methods
  async getSubjects() {
    return this.apiCall('/subjects');
  }
  
  async getSubjectById(id) {
    return this.apiCall(`/subjects/${id}`);
  }
  
  async addSubject(subjectData) {
    return this.apiCall('/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData),
    });
  }
  
  async updateSubject(id, subjectData) {
    return this.apiCall(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subjectData),
    });
  }
  
  async deleteSubject(id) {
    return this.apiCall(`/subjects/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Score API methods
  async getScores() {
    return this.apiCall('/scores');
  }
  
  async getScoresByStudent(studentId, term, year) {
    return this.apiCall(`/scores/by-student/${studentId}/${term}/${year}`);
  }
  
  async addScore(scoreData) {
    return this.apiCall('/scores', {
      method: 'POST',
      body: JSON.stringify(scoreData),
    });
  }
  
  async updateScore(id, scoreData) {
    return this.apiCall(`/scores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scoreData),
    });
  }
  
  async deleteScore(id) {
    return this.apiCall(`/scores/${id}`, {
      method: 'DELETE',
    });
  }
  
  // User API methods
  async getUsers() {
    return this.apiCall('/users');
  }
  
  async getUserById(id) {
    return this.apiCall(`/users/${id}`);
  }
  
  async addUser(userData) {
    return this.apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
  
  async updateUser(id, userData) {
    return this.apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
  
  async deleteUser(id) {
    return this.apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  }
  
  async createTeacherInvite(email, teacherId) {
    return this.apiCall('/users/invite/teacher', {
      method: 'POST',
      body: JSON.stringify({ email, teacherId }),
    });
  }

  // Settings API
  async getSetting(key) {
    return this.apiCall(`/settings/${key}`);
  }

  async updateSetting(key, value) {
    return this.apiCall(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    });
  }

  // Change password
  async changeUserPassword(id, currentPassword, newPassword) {
    return this.apiCall(`/users/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }
}

const apiService = new ApiService();
export default apiService;