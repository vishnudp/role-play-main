import { hasPermission } from '../utils/permissionUtils';

export function usePermission() {
  const stored = localStorage.getItem('permissions');
  const permissions: string[] = stored ? JSON.parse(stored) : [];

  return {
    permissions,
    can: (permission: string) => hasPermission(permissions, permission),
  };
}