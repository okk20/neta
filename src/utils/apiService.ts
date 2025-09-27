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

  async apiCall(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Add authorization header if token exists
    if (this.token) {
      (defaultOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }
    
    const config: RequestInit = {
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
    } catch (error: unknown) {
      console.error('API call failed:', error);
      // If it's a network error or parsing error, rethrow with more context
      if (error instanceof TypeError || (typeof error === 'object' && error !== null && 'message' in error && (error as Error).message.includes('Unexpected token'))) {
        throw new Error(`Failed to connect to server. Please check your network connection and try again. ${(error as Error).message}`);
      }
      throw error;
    }
  }
  
  // Auth API methods
  async login(username: string, password: string, role: string) {
    return this.apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  }
  
  async studentLogin(studentId: string, password: string) {
    return this.apiCall('/auth/student/login', {
      method: 'POST',
      body: JSON.stringify({ studentId, password }),
    });
  }
  
  async teacherLogin(teacherId: string, phoneNumber: string) {
    return this.apiCall('/auth/teacher/login', {
      method: 'POST',
      body: JSON.stringify({ teacherId, phoneNumber }),
    });
  }
  
  async teacherSignup(inviteToken: string, username: string, password: string, email: string, phone: string) {
    return this.apiCall('/auth/teacher/signup', {
      method: 'POST',
      body: JSON.stringify({ inviteToken, username, password, email, phone }),
    });
  }
  
  // Student API methods
  async getStudents() {
    return this.apiCall('/students');
  }
  
  async getStudentById(id: string) {
    return this.apiCall(`/students/${id}`);
  }
  
  async addStudent(studentData: any) {
    return this.apiCall('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }
  
  async updateStudent(id: string, studentData: any) {
    return this.apiCall(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }
  
  async deleteStudent(id: string) {
    return this.apiCall(`/students/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Teacher API methods
  async getTeachers() {
    return this.apiCall('/teachers');
  }
  
  async getTeacherById(id: string) {
    return this.apiCall(`/teachers/${id}`);
  }
  
  async addTeacher(teacherData: any) {
    return this.apiCall('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  }
  
  async updateTeacher(id: string, teacherData: any) {
    return this.apiCall(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData),
    });
  }
  
  async deleteTeacher(id: string) {
    return this.apiCall(`/teachers/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Subject API methods
  async getSubjects() {
    return this.apiCall('/subjects');
  }
  
  async getSubjectById(id: string) {
    return this.apiCall(`/subjects/${id}`);
  }
  
  async addSubject(subjectData: any) {
    return this.apiCall('/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData),
    });
  }
  
  async updateSubject(id: string, subjectData: any) {
    return this.apiCall(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subjectData),
    });
  }
  
  async deleteSubject(id: string) {
    return this.apiCall(`/subjects/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Score API methods
  async getScores() {
    return this.apiCall('/scores');
  }
  
  async getScoresByStudent(studentId: string, term: string, year: string) {
    return this.apiCall(`/scores/by-student/${studentId}/${term}/${year}`);
  }
  
  async addScore(scoreData: any) {
    return this.apiCall('/scores', {
      method: 'POST',
      body: JSON.stringify(scoreData),
    });
  }
  
  async updateScore(id: string, scoreData: any) {
    return this.apiCall(`/scores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scoreData),
    });
  }
  
  async deleteScore(id: string) {
    return this.apiCall(`/scores/${id}`, {
      method: 'DELETE',
    });
  }
  
  // User API methods
  async getUsers() {
    return this.apiCall('/users');
  }
  
  async getUserById(id: string) {
    return this.apiCall(`/users/${id}`);
  }
  
  async addUser(userData: any) {
    return this.apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
  
  async updateUser(id: string, userData: any) {
    return this.apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
  
  async deleteUser(id: string) {
    return this.apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  }
  
  async createTeacherInvite(email: string, teacherId: string) {
    return this.apiCall('/users/invite/teacher', {
      method: 'POST',
      body: JSON.stringify({ email, teacherId }),
    });
  }

  // Settings API
  async getSetting(key: string) {
    return this.apiCall(`/settings/${key}`);
  }

  async updateSetting(key: string, value: string) {
    return this.apiCall(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    });
  }

  // Change password
  async changeUserPassword(id: string, currentPassword: string, newPassword: string) {
    return this.apiCall(`/users/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }
}

const apiService = new ApiService();
export default apiService;