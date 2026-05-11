const db = require('../db');
const bcrypt = require('bcrypt');

// Get own profile
exports.getProfile = (req, res) => {
    const user_id = req.user.id;

    const sql = `
        SELECT users.id, users.name, users.email, roles.name AS role
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.id = ?
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error getting profile' });
        if (result.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(result[0]);
    });
};

// Update profile
exports.updateProfile = (req, res) => {
    const user_id = req.user.id;
    const { name, email } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Name is required' });
    }
    if (!email || email.trim() === '') {
        return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email already exists for another user
    const checkSql = 'SELECT * FROM users WHERE email = ? AND id != ?';

    db.query(checkSql, [email, user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error checking email' });

        if (result.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const updateSql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';

        db.query(updateSql, [name, email, user_id], (err) => {
            if (err) return res.status(500).json({ message: 'Error updating profile' });
            res.json({ message: 'Profile updated successfully' });
        });
    });
};

// Change password
exports.changePassword = (req, res) => {
    const user_id = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
        return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (new_password.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Get current password from database
    const sql = 'SELECT password FROM users WHERE id = ?';

    db.query(sql, [user_id], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Error getting user' });

        const isMatch = await bcrypt.compare(current_password, result[0].password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        const updateSql = 'UPDATE users SET password = ? WHERE id = ?';

        db.query(updateSql, [hashedPassword, user_id], (err) => {
            if (err) return res.status(500).json({ message: 'Error changing password' });
            res.json({ message: 'Password changed successfully' });
        });
    });
};