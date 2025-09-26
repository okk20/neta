import apiService from "./apiService";
import database, { type User as UserType } from "./database";
import { AUTH_MESSAGES, PASSWORD_MIN_LENGTH, USER_ROLES } from "../constants/auth";

export interface LoginFormData {
  username: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface TeacherSignupFormData {
  inviteToken: string;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone: string;
}

export interface StudentFormData {
  studentId: string;
  password: string;
}

export interface InviteFormData {
  teacherEmail: string;
  teacherName: string;
  teacherId: string;
}

export class AuthService {
  static async handleLogin(formData: LoginFormData): Promise<UserType> {
    try {
      const response = await apiService.login(formData.username, formData.password, formData.role);
      apiService.setToken(response.token);
      return response.user;
    } catch (error: any) {
      throw new Error(error.message || AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
  }

  static async handleStudentLogin(formData: StudentFormData): Promise<UserType> {
    try {
      const response = await apiService.studentLogin(formData.studentId, formData.password);
      apiService.setToken(response.token);
      return response.student;
    } catch (error: any) {
      throw new Error(error.message || AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
  }

  static async handleTeacherLogin(teacherId: string, phoneNumber: string): Promise<UserType> {
    try {
      const response = await apiService.teacherLogin(teacherId, phoneNumber);
      apiService.setToken(response.token);
      // Normalize teacher response into UserType shape expected by the app
      const teacher = response.teacher;
      const user: UserType = {
        id: teacher.id || teacher._id || teacher.teacherId,
        username: teacher.name || teacher.teacherId,
        password: '',
        role: 'teacher',
        email: teacher.email || '',
        phone: teacher.phone || '',
        status: 'active',
        lastLogin: new Date().toISOString(),
        teacherId: teacher.teacherId || teacher.id
      } as any;

      return user;
    } catch (error: any) {
      throw new Error(error.message || AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
  }

  static async handleTeacherSignup(
    formData: TeacherSignupFormData, 
    inviteValidation: UserType
  ): Promise<void> {
    if (formData.password !== formData.confirmPassword) {
      throw new Error(AUTH_MESSAGES.PASSWORDS_MISMATCH);
    }
    
    if (formData.password.length < PASSWORD_MIN_LENGTH) {
      throw new Error(AUTH_MESSAGES.PASSWORD_TOO_SHORT);
    }
    
    try {
      await apiService.teacherSignup(
        formData.inviteToken,
        formData.username,
        formData.password,
        formData.email,
        formData.phone
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create teacher account');
    }
  }

  static async validateInviteToken(token: string): Promise<UserType | null> {
    if (!token) {
      return null;
    }
    
    // In a real implementation, you would validate the token via the API
    // For now, we'll return a mock user
    return null;
  }

  static async sendTeacherInvite(formData: InviteFormData): Promise<string> {
    try {
      const response = await apiService.createTeacherInvite(
        formData.teacherEmail,
        formData.teacherId
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send teacher invite');
    }
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  static generateStudentPassword(studentId: string): string {
    // Simple password generation for demo - in production use proper password generation
    return `${studentId}@2024`;
  }

  static getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }

  static formatDateTime(date: Date): { date: string; time: string } {
    return {
      date: date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }
}

export const createInitialFormStates = () => ({
  login: {
    username: '',
    password: '',
    role: 'admin' as const
  },
  teacherSignup: {
    inviteToken: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: ''
  },
  student: {
    studentId: '',
    password: ''
  },
  invite: {
    teacherEmail: '',
    teacherName: '',
    teacherId: ''
  }
});