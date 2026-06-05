import { useMemo } from 'react';

const PERMISSIONS = {
  tutor: {
    students: ['view','create','edit'],
    classes: ['view'],
    subjects: ['view'],
    chapters: ['view','create','edit','delete'],
    tests: ['view','create','edit','delete'],
    questions: ['view','create','edit','delete'],
    dpq: ['view','create','edit','delete'],
    attendance: ['view','create','edit','delete'],
    fees: ['view'],
    notifications: ['view','create']
  },
  student: {
    students: ['view'],
    classes: ['view'],
    subjects: ['view'],
    chapters: ['view'],
    tests: ['view'],
    questions: ['view'],
    dpq: ['view'],
    attendance: ['view'],
    fees: ['view'],
    notifications: ['view']
  }
};

export function useAuth() {
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('alpha_user') || 'null'); } catch { return null; }
  }, [localStorage.getItem('alpha_user')]);

  const role = (user && user.role) ? user.role : 'student';

  function hasPermission(entity, action) {
    if (role === 'admin') return true;
    const ent = PERMISSIONS[role] && PERMISSIONS[role][entity];
    if (!ent) return false;
    return ent.includes(action);
  }

  return { user, role, hasPermission };
}

export default useAuth;
