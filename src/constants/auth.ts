export const AUTH_TABS = {
  LOGIN: 'login',
  STUDENT: 'student',
  TEACHER_SIGNUP: 'teacher-signup',
  INVITE: 'invite'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
} as const;

export const AUTH_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  INVALID_PASSWORD: 'Invalid password',
  INVALID_ROLE: 'Invalid role selected',
  ACCOUNT_INACTIVE: 'Account is not active. Please contact administrator.',
  LOGIN_SUCCESS: 'Login successful! Redirecting...',
  LOGIN_FAILED: 'Login failed. Please try again.',
  STUDENT_NOT_FOUND: 'Student ID not found',
  STUDENT_LOGIN_SUCCESS: 'Student login successful! Redirecting...',
  STUDENT_LOGIN_FAILED: 'Student login failed. Please try again.',
  PASSWORDS_MISMATCH: 'Passwords do not match',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
  VALIDATE_INVITE_FIRST: 'Please validate your invite token first',
  TEACHER_SIGNUP_SUCCESS: 'Teacher account created successfully! You can now login.',
  SIGNUP_FAILED: 'Signup failed. Please try again.',
  INVITE_TOKEN_VALID: 'Valid invite token! Please complete your registration.',
  INVITE_TOKEN_INVALID: 'Invalid or expired invite token',
  INVITE_TOKEN_ERROR: 'Error validating invite token',
  INVITE_SENT_SUCCESS: 'Invite sent successfully! Share this token with the teacher:',
  INVITE_SEND_FAILED: 'Failed to send invite. Please try again.'
} as const;

export const PASSWORD_MIN_LENGTH = 6;

export const DEFAULT_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  role: 'admin' as const
};

export const ROLE_ICONS = {
  [USER_ROLES.ADMIN]: 'Shield',
  [USER_ROLES.TEACHER]: 'Users',
  [USER_ROLES.STUDENT]: 'GraduationCap'
} as const;

export const TAB_ICONS = {
  [AUTH_TABS.LOGIN]: 'Shield',
  [AUTH_TABS.STUDENT]: 'GraduationCap', 
  [AUTH_TABS.TEACHER_SIGNUP]: 'UserPlus',
  [AUTH_TABS.INVITE]: 'Send'
} as const;