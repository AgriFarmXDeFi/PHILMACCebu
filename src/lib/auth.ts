import type { Student, AdminUser } from '@/types';
import { MOCK_STUDENTS } from '@/lib/mockData';

const STUDENT_KEY = 'philmac_student';
const ADMIN_KEY = 'philmac_admin';
const STUDENTS_KEY = 'philmac_students';

const ADMIN_CREDENTIALS = {
  email: 'admin@philmaccebu.com',
  password: 'admin2026',
};

export function initStudentsStore(): void {
  if (!localStorage.getItem(STUDENTS_KEY)) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(MOCK_STUDENTS));
  }
}

export function getStudentsStore(): Student[] {
  const data = localStorage.getItem(STUDENTS_KEY);
  return data ? JSON.parse(data) : MOCK_STUDENTS;
}

export function updateStudentsStore(students: Student[]): void {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

export function loginStudent(email: string, password: string): Student | null {
  const students = getStudentsStore();
  const student = students.find(s => s.email === email);
  if (!student) return null;
  if (password.length < 4) return null;
  localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
  return student;
}

export function loginAdmin(email: string, password: string): AdminUser | null {
  if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) return null;
  const admin: AdminUser = { id: 'admin-001', name: 'PHILMAC Admin', email, role: 'superadmin' };
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  return admin;
}

export function getCurrentStudent(): Student | null {
  const data = localStorage.getItem(STUDENT_KEY);
  if (!data) return null;
  const cached = JSON.parse(data) as Student;
  const students = getStudentsStore();
  return students.find(s => s.id === cached.id) || cached;
}

export function getCurrentAdmin(): AdminUser | null {
  const data = localStorage.getItem(ADMIN_KEY);
  return data ? JSON.parse(data) : null;
}

export function logoutStudent(): void {
  localStorage.removeItem(STUDENT_KEY);
}

export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_KEY);
}

export function refreshCurrentStudent(): void {
  const current = getCurrentStudent();
  if (!current) return;
  const students = getStudentsStore();
  const updated = students.find(s => s.id === current.id);
  if (updated) localStorage.setItem(STUDENT_KEY, JSON.stringify(updated));
}
