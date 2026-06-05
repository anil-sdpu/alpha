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

function hasPermission(role, entity, action) {
  if (!role) return false;
  if (role === 'admin') return true;
  const ent = PERMISSIONS[role] && PERMISSIONS[role][entity];
  if (!ent) return false;
  return ent.includes(action);
}

function requirePermission(entity, action) {
  return function (req, res, next) {
    const role = req.user && req.user.role ? req.user.role : 'student';
    if (hasPermission(role, entity, action)) return next();
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  };
}

module.exports = { hasPermission, requirePermission };
