import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { canView } from '../utils/permissions.js';
import { ROUTES } from '../config/routes.js';
import AccessDenied from '../pages/errors/AccessDenied.jsx';

/**
 * ProtectedRoute
 *
 * Wraps any /app route. Two gates run in order:
 *   1. Auth gate — both `isAuthenticated` and the JWT must be present,
 *      otherwise we send the visitor to /login (preserving the original
 *      location so they bounce back after a successful login).
 *   2. Module gate — when a `module` prop is supplied, the current role
 *      must also have view permission on that module. Failing the check
 *      renders the Access Denied page directly (no navigate) so the URL
 *      the user typed is preserved for support context.
 *
 * Pages mounted under `/app` without a module prop only get the auth
 * gate, which is correct for shared pages like Dashboard / Profile.
 */
export default function ProtectedRoute({ module, children }) {
  const { isAuthenticated, token, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !token) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (module && !canView(role, module)) {
    return <AccessDenied />;
  }

  return children;
}
