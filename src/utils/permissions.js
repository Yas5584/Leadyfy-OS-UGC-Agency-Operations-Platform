const ROLE_PERMISSIONS = {
  OWNER: ['dashboard', 'clients', 'orders', 'scripts', 'creators', 'shoots', 'videos', 'tasks', 'payments', 'expenses', 'payouts', 'support', 'notifications', 'employees', 'activity_logs', 'reports'],
  ADMIN: ['dashboard', 'clients', 'orders', 'scripts', 'creators', 'shoots', 'videos', 'tasks', 'payments', 'support', 'notifications', 'reports'],
  SALES: ['dashboard', 'clients', 'orders', 'tasks', 'support', 'notifications'],
  SCRIPT_WRITER: ['dashboard', 'scripts', 'tasks', 'notifications'],
  SHOOT_MANAGER: ['dashboard', 'shoots', 'creators', 'tasks', 'notifications'],
  EDITOR: ['dashboard', 'videos', 'tasks', 'notifications'],
  CLIENT: ['portal']
};

export const canAccess = (role, resource) => ROLE_PERMISSIONS[role]?.includes(resource) || false;
