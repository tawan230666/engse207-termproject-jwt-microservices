const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function seedUsers() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);

  const testUsers = [
    { user_id: 'user-001',   email: 'alice@example.com', role: 'member' },
    { user_id: 'user-002',   email: 'bob@example.com',   role: 'member' },
    { user_id: 'user-admin', email: 'admin@example.com', role: 'admin'  },
  ];

  for (const u of testUsers) {
    await pool.query(
      `INSERT INTO auth_users (user_id, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING`,
      [u.user_id, u.email, hash, u.role]
    );
  }

  console.log('[auth-db] ✅ Seed users created:');
  console.log('[auth-db]    alice@example.com  (member) | password: password123');
  console.log('[auth-db]    bob@example.com    (member) | password: password123');
  console.log('[auth-db]    admin@example.com  (admin)  | password: password123');
}

module.exports = { seedUsers };
