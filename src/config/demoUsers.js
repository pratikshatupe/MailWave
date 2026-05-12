import { ROLES } from './roles.js';

/**
 * Internal demo credentials for testing role-based dashboards.
 * NEVER render this list on the login page — it is for developer reference only.
 *
 *   superadmin@mailwave.com  /  Super@123       -> Super Admin
 *   admin@mailwave.com       /  Admin@123       -> Business Admin
 *   manager@mailwave.com     /  Manager@123     -> Marketing Manager
 *   viewer@mailwave.com      /  Viewer@123      -> Viewer / Analyst
 *   individual@mailwave.com  /  Individual@123  -> Individual User
 */
export const DEMO_USERS = [
  {
    email: 'superadmin@mailwave.com',
    password: 'Super@123',
    role: ROLES.SUPER_ADMIN,
    name: 'Alex Carter',
    tenantId: 'platform',
    plan: 'Platform',
  },
  {
    email: 'admin@mailwave.com',
    password: 'Admin@123',
    role: ROLES.BUSINESS_ADMIN,
    name: 'Jane Cooper',
    tenantId: 'tenant-acme',
    plan: 'Growth',
  },
  {
    email: 'manager@mailwave.com',
    password: 'Manager@123',
    role: ROLES.MARKETING_MANAGER,
    name: 'Devon Lane',
    tenantId: 'tenant-acme',
    plan: 'Growth',
  },
  {
    email: 'viewer@mailwave.com',
    password: 'Viewer@123',
    role: ROLES.VIEWER,
    name: 'Riya Sharma',
    tenantId: 'tenant-acme',
    plan: 'Growth',
  },
  {
    email: 'individual@mailwave.com',
    password: 'Individual@123',
    role: ROLES.INDIVIDUAL,
    name: 'Marco Diaz',
    tenantId: 'individual-marco',
    plan: 'Starter',
  },
];

export function findDemoUser(email, password) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return (
    DEMO_USERS.find(
      (u) => u.email.toLowerCase() === normalized && u.password === password
    ) || null
  );
}

export function findDemoUserByEmail(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return DEMO_USERS.find((u) => u.email.toLowerCase() === normalized) || null;
}
