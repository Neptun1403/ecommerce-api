const db = require('../db');

exports.getAllProducts = (req, res) => {
    const { search, category_id, min_price, max_price } = req.query;

    let sql = `
        SELECT products.*, categories.name AS category_name 
        FROM products 
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE 1=1
    `;

    const params = [];

    if (search) {
        sql += ' AND products.name LIKE ?';
        params.push(`%${search}%`);
    }

    if (category_id) {
        sql += ' AND products.category_id = ?';
        params.push(category_id);
    }

    if (min_price) {
        sql += ' AND products.price >= ?';
        params.push(min_price);
    }

    if (max_price) {
        sql += ' AND products.price <= ?';
        params.push(max_price);
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error getting products' });
        res.json(result);
    });
};

exports.getProductById = (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const sql = `
        SELECT products.*, categories.name AS category_name 
        FROM products 
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE products.id = ?
    `;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error getting product' });
        if (result.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(result[0]);
    });
};

exports.createProduct = (req, res) => {
    const { name, price, image_url, category_id } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Name is required' });
    }
    if (!price || isNaN(price)) {
        return res.status(400).json({ message: 'Valid price is required' });
    }

    const sql = 'INSERT INTO products (name, price, image_url, category_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, price, image_url || null, category_id || null], (err, result) => {
        if (err) {
            console.log('CREATE PRODUCT ERROR:', err);
            return res.status(500).json({ message: 'Error creating product' });
        }
        res.status(201).json({ message: 'Product created successfully', productId: result.insertId });
    });
};

exports.updateProduct = (req, res) => {
    const id = req.params.id;
    const { name, price, image_url, category_id } = req.body;

    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Name is required' });
    }
    if (!price || isNaN(price)) {
        return res.status(400).json({ message: 'Valid price is required' });
    }

    const sql = 'UPDATE products SET name = ?, price = ?, image_url = ?, category_id = ? WHERE id = ?';
    db.query(sql, [name, price, image_url || null, category_id || null, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating product' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product updated successfully' });
    });
};

exports.deleteProduct = (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const sql = 'DELETE FROM products WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting product' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    });
};