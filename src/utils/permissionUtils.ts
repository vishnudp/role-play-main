export type PermissionKey = string;

/**
 * Extract permission keys from user object
 */
export function extractPermissionKeys(user: any): PermissionKey[] {
  if (!user?.role?.permissions) return [];

  return user.role.permissions
    .map((rp: any) => rp?.permission?.key)
    .filter(Boolean);
}

/**
 * Check if permission exists
 */
export function hasPermission(
  permissions: PermissionKey[],
  required: PermissionKey
): boolean {
  return permissions.includes(required);
}