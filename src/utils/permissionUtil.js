// src/utils/permissionUtil.js
import { useAuth } from '../context/AuthContext';

/**
 * Hook to check if user has a specific permission
 */
export const usePermission = () => {
  const { user } = useAuth();
  
  const hasPermission = (permissionCode) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permissionCode);
  };
  
  const hasAnyPermission = (permissionCodes) => {
    if (!user || !user.permissions) return false;
    return permissionCodes.some(code => user.permissions.includes(code));
  };
  
  const hasAllPermissions = (permissionCodes) => {
    if (!user || !user.permissions) return false;
    return permissionCodes.every(code => user.permissions.includes(code));
  };
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
};

/**
 * Standalone function to check permissions (for non-component usage)
 */
export const checkPermission = (permissionCode, userPermissions) => {
  if (!userPermissions) return false;
  return userPermissions.includes(permissionCode);
};

/**
 * Check multiple permissions (any match)
 */
export const checkAnyPermission = (permissionCodes, userPermissions) => {
  if (!userPermissions) return false;
  return permissionCodes.some(code => userPermissions.includes(code));
};

/**
 * Check multiple permissions (all must match)
 */
export const checkAllPermissions = (permissionCodes, userPermissions) => {
  if (!userPermissions) return false;
  return permissionCodes.every(code => userPermissions.includes(code));
};