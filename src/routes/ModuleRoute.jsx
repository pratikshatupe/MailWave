import { useAuth } from '../context/AuthContext.jsx';
import { canView } from '../utils/permissions.js';
import AccessDenied from '../pages/errors/AccessDenied.jsx';

/**
 * ModuleRoute
 *
 * Per-module access gate. Renders the children when the current role has
 * view permission on `module`, otherwise renders the Access Denied page
 * inline so the original URL is preserved.
 *
 * Functionally a thin alias for `<ProtectedRoute module={...}>`. Kept
 * because routes/AppRoutes.jsx already uses it and renaming everywhere
 * would churn the diff without changing behaviour.
 */
export default function ModuleRoute({ module, children }) {
  const { role } = useAuth();
  if (!canView(role, module)) {
    return <AccessDenied />;
  }
  return children;
}
