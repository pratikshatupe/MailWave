import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import { ROUTES } from '../../config/routes.js';
import AccessDenied from '../errors/AccessDenied.jsx';

/**
 * Legacy /app/role-permissions route. Kept so that older bookmarks and
 * any in-flight UI links continue to resolve. We bounce the visitor to
 * the role-appropriate page:
 *  - Super Admin   → Platform RBAC
 *  - Business Admin → Team Permissions
 *  - Anyone else    → Access Denied (matches the spec — Marketing Manager,
 *                      Viewer and Individual should not see any RBAC UI).
 */
export default function RolePermissions() {
  const { role } = useAuth();
  if (role === ROLES.SUPER_ADMIN) {
    return <Navigate to={ROUTES.platformRbac} replace />;
  }
  if (role === ROLES.BUSINESS_ADMIN) {
    return <Navigate to={ROUTES.teamPermissions} replace />;
  }
  return <AccessDenied />;
}
