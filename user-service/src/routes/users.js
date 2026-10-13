const express = require('express');
const { pool } = require('../db/db');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/users/me — ดูโปรไฟล์ตัวเอง (ต้อง login)
// Users who registered through auth-service have no profile row yet, so the
// first call creates one from the verified JWT claims (database-per-service:
// each service owns its own data and syncs lazily from the token).
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { sub, email, role } = req.user;
    const name = req.user.name || (email ? email.split('@')[0] : sub);
    const result = await pool.query(
      `INSERT INTO user_profiles (user_id, name, email, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING *`,
      [sub, name, email, role || 'member']
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('[USER] /me error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users — ดู users ทั้งหมด (admin only)
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, user_id, name, email, role, created_at FROM user_profiles ORDER BY created_at DESC'
    );
    res.json({ users: result.rows, total: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

module.exports = router;
