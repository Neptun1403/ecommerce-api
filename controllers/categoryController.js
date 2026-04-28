const db = require('../db');

exports.getAllCategories = (req, res) => {
    const sql = 'SELECT * FROM categories';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error getting categories' });
        res.json(result);
    });
};

exports.getCategoryById = (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const sql = 'SELECT * FROM categories WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error getting category' });
        if (result.length === 0) return res.status(404).json({ message: 'Category not found' });
        res.json(result[0]);
    });
};

exports.createCategory = (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Name is required' });
    }
    if (name.length < 3) {
        return res.status(400).json({ message: 'Name must be at least 3 characters' });
    }

    const sql = 'INSERT INTO categories (name) VALUES (?)';
    db.query(sql, [name], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error creating category' });
        res.status(201).json({ message: 'Category created successfully', categoryId: result.insertId });
    });
};

exports.updateCategory = (req, res) => {
    const id = req.params.id;
    const { name } = req.body;

    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Name is required' });
    }
    if (name.length < 3) {
        return res.status(400).json({ message: 'Name must be at least 3 characters' });
    }

    const sql = 'UPDATE categories SET name = ? WHERE id = ?';
    db.query(sql, [name, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating category' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category updated successfully' });
    });
};

exports.deleteCategory = (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const sql = 'DELETE FROM categories WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting category' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    });
};