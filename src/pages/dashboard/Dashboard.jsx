import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import SuperAdminDashboard from './SuperAdminDashboard.jsx';
import BusinessAdminDashboard from './BusinessAdminDashboard.jsx';
import MarketingManagerDashboard from './MarketingManagerDashboard.jsx';
import ViewerDashboard from './ViewerDashboard.jsx';
import IndividualDashboard from './IndividualDashboard.jsx';

export default function Dashboard() {
  const { role } = useAuth();
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return <SuperAdminDashboard />;
    case ROLES.BUSINESS_ADMIN:
      return <BusinessAdminDashboard />;
    case ROLES.MARKETING_MANAGER:
      return <MarketingManagerDashboard />;
    case ROLES.VIEWER:
      return <ViewerDashboard />;
    case ROLES.INDIVIDUAL:
      return <IndividualDashboard />;
    default:
      return null;
  }
}
