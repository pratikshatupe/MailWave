import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../config/routes.js';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();

  // Both flags must agree — `isAuthenticated` is the user-state flag, `token`
  // is the JWT the backend issued. Missing either one means we cannot make
  // authenticated requests, so kick back to /login.
  if (!isAuthenticated || !token) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return children;
}
