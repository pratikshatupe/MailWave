/**
 * demo-users.js
 *
 * Kebab-case re-export of the canonical demoUsers config. New code should
 * import from here so file names stay consistent with project conventions.
 */

import { DEMO_USERS, findDemoUser, findDemoUserByEmail } from './demoUsers.js';

export { DEMO_USERS, findDemoUser, findDemoUserByEmail };
export default DEMO_USERS;
