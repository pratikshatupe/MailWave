import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { canView } from '../utils/permissions.js';
import { ROUTES } from '../config/routes.js';

export default function ModuleRoute({ module, children }) {
  const { role } = useAuth();
  if (!canView(role, module)) {
    return <Navigate to={ROUTES.accessDenied} replace />;
  }
  return children;
}
