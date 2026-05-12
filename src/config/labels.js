/**
 * labels.js
 *
 * Central label dictionary. NEVER hardcode these strings inside components.
 *
 * Rules:
 *  - Use "Action" when only one action exists, "Actions" when multiple.
 *  - Use "Log In" / "Log Out" (never Login / Logout).
 *  - Use "Email ID" (never Email or Email Address).
 *  - Use "Contact Number" (never Phone or Mobile).
 *  - Use "Postal Code" (never PIN).
 *  - British English spelling everywhere.
 */

export const LABELS = {
  // Identity
  emailId: 'Email ID',
  contactNumber: 'Contact Number',
  postalCode: 'Postal Code',
  fullName: 'Full Name',
  firstName: 'First Name',
  lastName: 'Last Name',
  organisation: 'Organisation',

  // Auth
  logIn: 'Log In',
  logOut: 'Log Out',
  signIn: 'Sign In',
  signUp: 'Sign Up',
  forgotPassword: 'Forgot Password',
  rememberMe: 'Remember Me',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  newPassword: 'New Password',
  currentPassword: 'Current Password',
  changePassword: 'Change Password',

  // Address / Location
  country: 'Country',
  state: 'State',
  city: 'City',
  address: 'Address',

  // Common columns
  serialNumber: 'SR. No.',
  action: 'Action',
  actions: 'Actions',
  date: 'Date',
  status: 'Status',
  createdAt: 'Created At',
  updatedAt: 'Updated At',

  // Search & buttons
  search: 'Search',
  cancel: 'Cancel',
  save: 'Save',
  update: 'Update',
  delete: 'Delete',
  confirm: 'Confirm',
  submit: 'Submit',
  create: 'Create',
  edit: 'Edit',
  view: 'View',
  export: 'Export',

  // Help / nav
  faqs: 'FAQs',
  dashboard: 'Dashboard',
  profile: 'Profile',
  settings: 'Settings',
  notifications: 'Notifications',

  // Mailwave specific
  campaign: 'Campaign',
  campaigns: 'Campaigns',
  template: 'Template',
  templates: 'Templates',
  contact: 'Contact',
  contacts: 'Contacts',
  segment: 'Segment',
  segments: 'Segments',
  automation: 'Automation',
  automations: 'Automations',
  analytics: 'Analytics',
  reports: 'Reports',
  announcements: 'Announcements',
  coupons: 'Coupons',
  referrals: 'Referrals',
  subscription: 'Subscription',
  billing: 'Billing',
  apiIntegrations: 'API Integrations',
  auditLogs: 'Audit Logs',
  rolePermissions: 'Role Permissions',
  teamMembers: 'Team Members',
  plans: 'Plans',
  tenants: 'Tenants / Organisations',
  users: 'Users',
  payments: 'Payments',
  subscriptions: 'Subscriptions',
  approvalWorkflow: 'Approval Workflow',
  campaignName: 'Campaign Name',
  templateName: 'Template Name',
  subjectLine: 'Subject Line',
  senderName: 'Sender Name',
  senderEmailId: 'Sender Email ID',
  couponCode: 'Coupon Code',
  referralCode: 'Referral Code',
  planName: 'Plan Name',
  price: 'Price',
  message: 'Message',
  description: 'Description',
  time: 'Time',
};

/**
 * Return action column header based on number of actions.
 *  - 1 action  -> "Action"
 *  - 2+ actions -> "Actions"
 */
export function actionColumnLabel(actionCount = 1) {
  return actionCount > 1 ? LABELS.actions : LABELS.action;
}

export default LABELS;
