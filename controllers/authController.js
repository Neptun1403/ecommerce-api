require('dotenv').config();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }

    try {
        const checkUserSql = 'SELECT * FROM users WHERE email = ?';

        db.query(checkUserSql, [email], async (err, userResult) => {
            if (err) return res.status(500).json({ message: 'Database error (checking user)' });

            if (userResult.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const roleName = role || 'user';
            const getRoleSql = 'SELECT id FROM roles WHERE name = ?';

            db.query(getRoleSql, [roleName], async (err, roleResult) => {
                if (err) return res.status(500).json({ message: 'Database error (getting role)' });

                if (roleResult.length === 0) {
                    return res.status(400).json({ message: 'Invalid role' });
                }

                const roleId = roleResult[0].id;
                const hashedPassword = await bcrypt.hash(password, 10);

                const insertSql = 'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)';

                db.query(insertSql, [name, email, hashedPassword, roleId], (err, result) => {
                    if (err) return res.status(500).json({ message: 'Error creating user' });

                    res.status(201).json({
                        message: 'User registered successfully',
                        user: { id: result.insertId, name, email, role: roleName }
                    });
                });
            });
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const sql = `
        SELECT users.*, roles.name AS role
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.email = ?
    `;

    db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (result.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    });
};