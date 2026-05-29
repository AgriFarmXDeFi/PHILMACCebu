import { useState, useEffect } from 'react';
import type { Student, AdminUser } from '@/types';
import { getCurrentStudent, getCurrentAdmin, logoutStudent, logoutAdmin, initStudentsStore } from '@/lib/auth';

export function useStudentAuth() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStudentsStore();
    setStudent(getCurrentStudent());
    setLoading(false);
  }, []);

  const logout = () => {
    logoutStudent();
    setStudent(null);
  };

  return { student, loading, logout, setStudent };
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStudentsStore();
    setAdmin(getCurrentAdmin());
    setLoading(false);
  }, []);

  const logout = () => {
    logoutAdmin();
    setAdmin(null);
  };

  return { admin, loading, logout, setAdmin };
}
