// Definición centralizada de roles y permisos
export const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  USER_STATS_READ: 'user:stats:read',
  USER_MANAGE: 'user:manage',
  PRODUCT_READ: 'product:read',
  PRODUCT_WRITE: 'product:write',
  PRODUCT_DELETE: 'product:delete',
};

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const ROLE_PERMISSIONS = {
  [ROLES.USER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.PRODUCT_READ,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_STATS_READ,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_WRITE,
    PERMISSIONS.PRODUCT_DELETE,
  ],
};
