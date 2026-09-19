// ─── RBAC & Permission Management ────────────────────────
// Source of truth: Leadyfy OS Technical & Operational Specification

export const DEFAULT_ROLE_PERMISSIONS = {
  OWNER: {
    dashboard: ['view', 'manage'],
    clients: ['view', 'create', 'edit', 'delete'],
    orders: ['view', 'create', 'edit', 'delete'],
    scripts: ['view', 'create', 'edit', 'delete'],
    creators: ['view', 'create', 'edit', 'delete'],
    shoots: ['view', 'create', 'edit', 'delete'],
    videos: ['view', 'create', 'edit', 'delete'],
    tasks: ['view', 'create', 'edit', 'delete'],
    payments: ['view', 'create', 'edit', 'delete'],
    expenses: ['view', 'create', 'edit', 'delete'],
    payouts: ['view', 'create', 'edit', 'delete'],
    support: ['view', 'create', 'edit', 'delete'],
    notifications: ['view', 'manage'],
    employees: ['view', 'create', 'edit', 'delete'],
    activity_logs: ['view'],
    reports: ['view', 'export']
  },
  ADMIN: {
    dashboard: ['view', 'manage'],
    clients: ['view', 'create', 'edit', 'delete'],
    orders: ['view', 'create', 'edit', 'delete'],
    scripts: ['view', 'create', 'edit', 'delete'],
    creators: ['view', 'create', 'edit', 'delete'],
    shoots: ['view', 'create', 'edit', 'delete'],
    videos: ['view', 'create', 'edit', 'delete'],
    tasks: ['view', 'create', 'edit', 'delete'],
    payments: ['view', 'create', 'edit'],
    expenses: ['view', 'create'],
    payouts: ['view', 'create', 'edit'],
    support: ['view', 'create', 'edit', 'delete'],
    notifications: ['view', 'manage'],
    employees: ['view', 'edit'],
    activity_logs: ['view'],
    reports: ['view', 'export']
  },
  SALES: {
    dashboard: ['view'],
    clients: ['view', 'create', 'edit'],
    orders: ['view', 'create', 'edit'],
    tasks: ['view', 'create', 'edit'],
    support: ['view', 'create'],
    notifications: ['view']
  },
  SCRIPT_WRITER: {
    dashboard: ['view'],
    scripts: ['view', 'edit'],
    tasks: ['view', 'create', 'edit'],
    notifications: ['view']
  },
  SHOOT_MANAGER: {
    dashboard: ['view'],
    shoots: ['view', 'create', 'edit'],
    creators: ['view', 'edit'],
    tasks: ['view', 'create', 'edit'],
    notifications: ['view']
  },
  EDITOR: {
    dashboard: ['view'],
    videos: ['view', 'edit'],
    tasks: ['view', 'create', 'edit'],
    notifications: ['view']
  },
  CLIENT: {
    portal: ['view', 'create', 'edit']
  }
};

// Load permissions from localStorage if customized, otherwise use default
export const getActivePermissions = () => {
  try {
    const stored = localStorage.getItem('leadyfy_role_permissions');
    if (stored) {
      return { ...DEFAULT_ROLE_PERMISSIONS, ...JSON.parse(stored) };
    }
  } catch {}
  return DEFAULT_ROLE_PERMISSIONS;
};

export const savePermissions = (newPermissions) => {
  try {
    localStorage.setItem('leadyfy_role_permissions', JSON.stringify(newPermissions));
    return true;
  } catch {
    return false;
  }
};

export const resetPermissions = () => {
  try {
    localStorage.removeItem('leadyfy_role_permissions');
    return true;
  } catch {
    return false;
  }
};

// Module access check (backward-compatible)
export const canAccess = (role, resource, action = 'view') => {
  if (!role || !resource) return false;
  if (role === 'OWNER') return true; // Owner has full unrestricted access
  
  const perms = getActivePermissions();
  const rolePerms = perms[role];
  if (!rolePerms) return false;

  const resourceActions = rolePerms[resource];
  if (!resourceActions) return false;

  if (Array.isArray(resourceActions)) {
    // If checking module visibility (default 'view')
    if (action === 'view') return resourceActions.length > 0;
    return resourceActions.includes(action);
  }

  return false;
};

// Granular CRUD helper checks
export const canCreate = (role, resource) => canAccess(role, resource, 'create');
export const canEdit = (role, resource) => canAccess(role, resource, 'edit');
export const canDelete = (role, resource) => canAccess(role, resource, 'delete');
