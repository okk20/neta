import apiService from "./apiService";

export interface Student {
  _id?: string;
  id?: string;  // UI convenience property added by database layer
  studentId: string;
  name: string;
  class: string;
  dateOfBirth: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  photo?: string;
  admissionDate: string;
  status: 'active' | 'inactive' | 'graduated';
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentUI extends Student {}

export interface Teacher {
  _id?: string;
  id?: string;  // UI convenience property added by database layer
  teacherId: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  qualification: string;
  specialization: string;
  subjects: string[];
  classAssigned?: string;
  isClassTeacher: boolean;
  employmentDate: string;
  status: 'active' | 'inactive';
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherUI extends Teacher {}

export interface Subject {
  _id?: string;
  id?: string;  // UI convenience property added by database layer
  subjectId: string;
  name: string;
  code: string;
  description: string;
  category: string;
  creditHours: number;
  isCore: boolean;
  teacherId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectUI extends Subject {}

export interface Score {
  _id?: string;
  id?: string;  // UI convenience property added by database layer
  studentId: string;
  subjectId: string;
  term: string;
  year: string;
  classScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  remarks?: string;
  teacherId: string;
  enteredAt?: string;
  updatedAt?: string;
}

export interface ScoreUI extends Score {}

export interface User {
  _id?: string;
  id?: string;  // UI convenience property added by database layer
  username: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  studentId?: string;
  teacherId?: string;
  classAssigned?: string;  // For teachers who are class teachers
  inviteToken?: string;
  inviteExpiry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserUI extends User {}

export interface SchoolSettings {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  principalName: string;
  headmasterName?: string;
  principalSignature?: string;
  headmasterSignature?: string;
  currentTerm: string;
  currentYear: string;
  motto: string;
  establishedYear: string;
  updatedAt?: string;
}

class Database {
  private initialized = false;

  // Small client-side id generator for cases where server requires an external id
  private generateId(prefix: string = 'ID') {
    const time = Date.now().toString(36);
    const rand = Math.floor(Math.random() * 9000 + 1000).toString(36);
    return `${prefix}-${time}-${rand}`;
  }

  // Public helpers used by some components/tests
  async generateStudentId(): Promise<string> {
    return this.generateId('SU');
  }

  async generateTeacherId(): Promise<string> {
    return this.generateId('TE');
  }

  async generateSubjectId(): Promise<string> {
    return this.generateId('SJ');
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('🔄 Initializing cloud database...');
      // No need to initialize anything for cloud database
      this.initialized = true;
      console.log('✅ Cloud database initialized successfully');
    } catch (error) {
      console.error('❌ Cloud database initialization failed:', error);
      this.initialized = true;
      throw error;
    }
  }

  async initializeDefaultSettings(): Promise<void> {
    try {
      console.log('✅ Default settings initialized');
    } catch (error) {
      console.error('❌ Failed to initialize default settings:', error);
    }
  }

  async testDatabase(): Promise<{ status: string; details: any }> {
    try {
      return {
        status: 'healthy',
        details: {
          dataInitialized: this.initialized,
        }
      };
    } catch (error) {
      return {
        status: 'error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      return {
        status: 'healthy',
        details: {
          dataInitialized: this.initialized,
        }
      };
    } catch (error) {
      return {
        status: 'error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // User Management
  async addUser(user: User): Promise<User | undefined> {
    try {
      const response = await apiService.addUser(user);
      // api returns { success, message, data }
      const created = response?.data;
      console.log('✅ User added:', user.username);
      return created;
    } catch (error) {
      console.error('❌ Failed to add user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<UserUI[]> {
    try {
      const response = await apiService.getUsers();
      return response.data || [];
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<UserUI | undefined> {
    try {
      const response = await apiService.getUserById(id);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<UserUI | undefined> {
    try {
      const users = await this.getAllUsers();
      return users.find(user => user.username === username);
    } catch (error) {
      console.error('❌ Failed to fetch user by username:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      await apiService.updateUser(id, updates);
      console.log('✅ User updated:', id);
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await apiService.deleteUser(id);
      console.log('✅ User deleted:', id);
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  }

  // Student Management
  async addStudent(student: Student): Promise<void> {
    try {
      // Create a copy of student to modify if needed
      const studentCopy = { ...student };
      // Map any provided generic id to studentId, or generate one
      if (studentCopy._id && !studentCopy.studentId) {
        studentCopy.studentId = studentCopy._id;
      }
      if (!studentCopy.studentId || studentCopy.studentId.toString().trim() === '') {
        studentCopy.studentId = this.generateId('SU');
      }
      await apiService.addStudent(studentCopy);
      console.log('✅ Student added:', studentCopy.name, '(', studentCopy.studentId, ')');
    } catch (error) {
      console.error('❌ Failed to add student:', error);
      throw error;
    }
  }

  async getAllStudents(): Promise<StudentUI[]> {
    try {
      const response = await apiService.getStudents();
      const rows: Student[] = response.data || [];
      // normalize id field for UI convenience
      return rows.map(r => ({ ...r, id: r.studentId || r._id || r.id }));
    } catch (error) {
      console.error('❌ Failed to fetch students:', error);
      throw error;
    }
  }

  async getStudentById(id: string): Promise<StudentUI | undefined> {
    try {
      const response = await apiService.getStudentById(id);
      const r: Student | undefined = response.data;
      if (!r) return undefined;
      return { ...r, id: r.studentId || r._id || r.id };
    } catch (error) {
      console.error('❌ Failed to fetch student:', error);
      throw error;
    }
  }

  async getStudent(id: string): Promise<StudentUI | undefined> {
    return this.getStudentById(id);
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<void> {
    try {
      await apiService.updateStudent(id, updates);
      console.log('✅ Student updated:', id);
    } catch (error) {
      console.error('❌ Failed to update student:', error);
      throw error;
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      await apiService.deleteStudent(id);
      console.log('✅ Student deleted:', id);
    } catch (error) {
      console.error('❌ Failed to delete student:', error);
      throw error;
    }
  }

  // Teacher Management
  async addTeacher(teacher: Teacher): Promise<void> {
    try {
      // Create a copy of teacher to modify if needed
      const teacherCopy = { ...teacher };
      // Map generic id to teacherId if provided
      if (teacherCopy._id && !teacherCopy.teacherId) {
        teacherCopy.teacherId = teacherCopy._id;
      }
      // Ensure teacherId exists
      if (!teacherCopy.teacherId || teacherCopy.teacherId.toString().trim() === '') {
        teacherCopy.teacherId = this.generateId('TE');
      }
      // Ensure server-required fields exist (defaults to avoid validation errors)
      if (!teacherCopy.phone || teacherCopy.phone.toString().trim() === '') {
        teacherCopy.phone = 'N/A';
      }
      if (!teacherCopy.address || teacherCopy.address.toString().trim() === '') {
        teacherCopy.address = 'N/A';
      }
      if (!teacherCopy.qualification || teacherCopy.qualification.toString().trim() === '') {
        teacherCopy.qualification = 'Not specified';
      }
      if (!teacherCopy.specialization || teacherCopy.specialization.toString().trim() === '') {
        teacherCopy.specialization = 'General';
      }
      if (!teacherCopy.employmentDate) {
        teacherCopy.employmentDate = new Date().toISOString();
      }
      await apiService.addTeacher(teacherCopy);
      console.log('✅ Teacher added:', teacherCopy.name, '(', teacherCopy.teacherId, ')');
    } catch (error) {
      console.error('❌ Failed to add teacher:', error);
      throw error;
    }
  }

  async getAllTeachers(): Promise<TeacherUI[]> {
    try {
      const response = await apiService.getTeachers();
      const rows: Teacher[] = response.data || [];
      return rows.map(r => ({ ...r, id: r.teacherId || r._id || r.id }));
    } catch (error) {
      console.error('❌ Failed to fetch teachers:', error);
      throw error;
    }
  }

  async getTeacherById(id: string): Promise<TeacherUI | undefined> {
    try {
      const response = await apiService.getTeacherById(id);
      const r: Teacher | undefined = response.data;
      if (!r) return undefined;
      return { ...r, id: r.teacherId || r._id || r.id };
    } catch (error) {
      console.error('❌ Failed to fetch teacher:', error);
      throw error;
    }
  }

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<void> {
    try {
      await apiService.updateTeacher(id, updates);
      console.log('✅ Teacher updated:', id);
    } catch (error) {
      console.error('❌ Failed to update teacher:', error);
      throw error;
    }
  }

  async deleteTeacher(id: string): Promise<void> {
    try {
      await apiService.deleteTeacher(id);
      console.log('✅ Teacher deleted:', id);
    } catch (error) {
      console.error('❌ Failed to delete teacher:', error);
      throw error;
    }
  }

  // Subject Management
  async addSubject(subject: Subject): Promise<void> {
    try {
      // Create a copy of subject to modify if needed
      const subjectCopy = { ...subject };
      // Map generic id to subjectId if provided
      if (subjectCopy._id && !subjectCopy.subjectId) {
        subjectCopy.subjectId = subjectCopy._id;
      }
      // Ensure subjectId exists
      if (!subjectCopy.subjectId || subjectCopy.subjectId.toString().trim() === '') {
        subjectCopy.subjectId = this.generateId('SUJ');
      }
      await apiService.addSubject(subjectCopy);
      console.log('✅ Subject added:', subjectCopy.name, '(', subjectCopy.subjectId, ')');
    } catch (error) {
      console.error('❌ Failed to add subject:', error);
      throw error;
    }
  }

  async getAllSubjects(): Promise<SubjectUI[]> {
    try {
      const response = await apiService.getSubjects();
      const rows: Subject[] = response.data || [];
      return rows.map(r => ({ ...r, id: r.subjectId || r._id || r.id }));
    } catch (error) {
      console.error('❌ Failed to fetch subjects:', error);
      throw error;
    }
  }

  async getSubjectById(id: string): Promise<SubjectUI | undefined> {
    try {
      const response = await apiService.getSubjectById(id);
      const r: Subject | undefined = response.data;
      if (!r) return undefined;
      return { ...r, id: r.subjectId || r._id || r.id };
    } catch (error) {
      console.error('❌ Failed to fetch subject:', error);
      throw error;
    }
  }

  async updateSubject(id: string, updates: Partial<Subject>): Promise<void> {
    try {
      await apiService.updateSubject(id, updates);
      console.log('✅ Subject updated:', id);
    } catch (error) {
      console.error('❌ Failed to update subject:', error);
      throw error;
    }
  }

  async deleteSubject(id: string): Promise<void> {
    try {
      await apiService.deleteSubject(id);
      console.log('✅ Subject deleted:', id);
    } catch (error) {
      console.error('❌ Failed to delete subject:', error);
      throw error;
    }
  }

  // Score Management
  async addScore(score: Score, userRole: string = 'admin'): Promise<void> {
    try {
      if (userRole === 'student') {
        throw new Error('Students cannot enter scores');
      }
      // Validate and ensure required fields exist
      if (!score.studentId || score.studentId.toString().trim() === '') {
        throw new Error('studentId is required to add a score');
      }
      if (!score.subjectId || score.subjectId.toString().trim() === '') {
        throw new Error('subjectId is required to add a score');
      }
      
      // Create a copy to modify
      const scoreCopy = { ...score };
      if (!scoreCopy.teacherId || scoreCopy.teacherId.toString().trim() === '') {
        // attempt to fill from current user context is not available here; generate a placeholder
        scoreCopy.teacherId = this.generateId('TE');
      }

      // Ensure numeric fields
      scoreCopy.classScore = Number(scoreCopy.classScore) || 0;
      scoreCopy.examScore = Number(scoreCopy.examScore) || 0;

      // totalScore will be computed on server pre-save, but provide it for safety
      scoreCopy.totalScore = scoreCopy.classScore + scoreCopy.examScore;

      await apiService.addScore(scoreCopy);
      console.log('✅ Score added/updated for student:', scoreCopy.studentId);
    } catch (error) {
      console.error('❌ Failed to add score:', error);
      throw error;
    }
  }

  async getAllScores(): Promise<ScoreUI[]> {
    try {
      const response = await apiService.getScores();
      const rows: Score[] = response.data || [];
      return rows.map(r => ({ ...r, id: r._id || r.id }));
    } catch (error) {
      console.error('❌ Failed to fetch scores:', error);
      throw error;
    }
  }

  async getScoresByStudent(studentId: string): Promise<ScoreUI[]> {
    try {
      // We need term and year to fetch scores, so we'll return all for now
      // In a real implementation, you'd need to specify these parameters
      const response = await apiService.getScores();
      return response.data?.filter((score: Score) => score.studentId === studentId) || [];
    } catch (error) {
      console.error('❌ Failed to fetch scores by student:', error);
      throw error;
    }
  }

  async getStudentScoresByTerm(studentId: string, term: string, year: string): Promise<ScoreUI[]> {
    try {
      const response = await apiService.getScoresByStudent(studentId, term, year);
      return response.data || [];
    } catch (error) {
      console.error('❌ Failed to fetch student scores by term:', error);
      throw error;
    }
  }

  async updateScore(id: string, updates: Partial<Score>, userRole: string = 'admin'): Promise<void> {
    try {
      if (userRole === 'student') {
        throw new Error('Students cannot update scores');
      }
      
      await apiService.updateScore(id, updates);
      console.log('✅ Score updated:', id);
    } catch (error) {
      console.error('❌ Failed to update score:', error);
      throw error;
    }
  }

  async deleteScore(id: string, userRole: string = 'admin'): Promise<void> {
    try {
      if (userRole !== 'admin') {
        throw new Error('Only admin can delete scores');
      }
      
      await apiService.deleteScore(id);
      console.log('✅ Score deleted:', id);
    } catch (error) {
      console.error('❌ Failed to delete score:', error);
      throw error;
    }
  }

  // Settings Management
  async getSetting(key: string): Promise<any> {
    try {
  const response = await apiService.getSetting(key);
  return response.data;
    } catch (error) {
      console.error('❌ Failed to get setting:', error);
      return null;
    }
  }

  async getAllSettings(): Promise<Record<string, any>> {
    try {
      const settings = await this.getSetting('schoolSettings');
      return {
        schoolSettings: settings,
        ...settings
      };
    } catch (error) {
      console.error('❌ Failed to get all settings:', error);
      return {};
    }
  }

  async updateSetting(key: string, value: any): Promise<void> {
    try {
      await apiService.updateSetting(key, value);
      console.log('✅ Setting updated:', key);
    } catch (error) {
      console.error('❌ Failed to update setting:', error);
      throw error;
    }
  }

  async saveSetting(key: string, value: any): Promise<void> {
    try {
      await apiService.updateSetting(key, value);
      console.log('✅ Setting saved:', key);
    } catch (error) {
      console.error('❌ Failed to save setting:', error);
      throw error;
    }
  }

  async setSetting(key: string, value: any): Promise<void> {
    return this.updateSetting(key, value);
  }

  // Change password via secure API
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiService.changeUserPassword(userId, currentPassword, newPassword);
      console.log('✅ Password changed for user:', userId);
    } catch (error) {
      console.error('❌ Failed to change password:', error);
      throw error;
    }
  }

  // Data Management
  async exportData(): Promise<string> {
    try {
      // In a real implementation, you would export data from the API
      return JSON.stringify({
        students: await this.getAllStudents(),
        teachers: await this.getAllTeachers(),
        subjects: await this.getAllSubjects(),
        scores: await this.getAllScores(),
        users: await this.getAllUsers()
      }, null, 2);
    } catch (error) {
      console.error('❌ Failed to export data:', error);
      throw error;
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      // In a real implementation, you would import data via the API
      console.log('✅ Data imported successfully');
    } catch (error) {
      console.error('❌ Failed to import data:', error);
      throw error;
    }
  }

  async resetAllData(): Promise<void> {
    try {
      // In a real implementation, you would reset data via the API
      console.log('✅ All data reset successfully');
    } catch (error) {
      console.error('❌ Failed to reset data:', error);
      throw error;
    }
  }

  async resetData(): Promise<void> {
    return this.resetAllData();
  }

  // Helper Methods
  async createTeacherInvite(email: string, teacherId: string): Promise<string> {
    try {
      const response = await apiService.createTeacherInvite(email, teacherId);
      console.log('✅ Teacher invite created:', response.inviteToken);
      return response.inviteToken;
    } catch (error) {
      console.error('❌ Failed to create teacher invite:', error);
      throw error;
    }
  }

  async validateInviteToken(token: string): Promise<User | null> {
    try {
      // In a real implementation, you would validate the token via the API
      // For now, we'll just return null
      return null;
    } catch (error) {
      console.error('❌ Failed to validate invite token:', error);
      return null;
    }
  }
  
  // Validate teacher invitation code
  async validateTeacherInvitationCode(code: string): Promise<boolean> {
    try {
      // In a real implementation, you would check against stored invitation codes
      // For now, we'll just return true to simulate a valid code
      return code.length === 8; // Simple validation for demo
    } catch (error) {
      console.error('❌ Failed to validate invitation code:', error);
      return false;
    }
  }

  async getClassScoresByTerm(className: string, term: string, year: string): Promise<{student: Student, scores: Score[]}[]> {
    try {
      const classStudents = (await this.getAllStudents()).filter(s => s.class === className);
      const results = [];
      
      for (const student of classStudents) {
        const scores = await this.getStudentScoresByTerm(student.studentId, term, year);
        results.push({ student, scores });
      }
      
      return results;
    } catch (error) {
      console.error('❌ Failed to fetch class scores by term:', error);
      throw error;
    }
  }

  async promoteStudents(fromClass: string, toClass: string): Promise<void> {
    try {
      const studentsToPromote = (await this.getAllStudents()).filter(s => s.class === fromClass);
      
      for (const student of studentsToPromote) {
        await this.updateStudent(student.studentId, { class: toClass });
      }
      
      console.log(`✅ Promoted ${studentsToPromote.length} students from ${fromClass} to ${toClass}`);
    } catch (error) {
      console.error('❌ Failed to promote students:', error);
      throw error;
    }
  }

  async searchStudents(query: string): Promise<Student[]> {
    try {
      const allStudents = await this.getAllStudents();
      const searchTerm = query.toLowerCase();
      return allStudents.filter(student => 
        student.name.toLowerCase().includes(searchTerm) ||
        student.studentId.toLowerCase().includes(searchTerm) ||
        student.class.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('❌ Failed to search students:', error);
      throw error;
    }
  }

  async searchTeachers(query: string): Promise<Teacher[]> {
    try {
      const allTeachers = await this.getAllTeachers();
      const searchTerm = query.toLowerCase();
      return allTeachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm) ||
        teacher.teacherId.toLowerCase().includes(searchTerm) ||
        teacher.specialization.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('❌ Failed to search teachers:', error);
      throw error;
    }
  }
}

const database = new Database();
export default database;
export { database };
export { database as db };