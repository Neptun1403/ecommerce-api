const db = require('../db');

// Add item to cart
exports.addToCart = (req, res) => {
    const user_id = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    // Check if product already in cart
    const checkSql = 'SELECT * FROM cart WHERE user_id = ? AND product_id = ?';

    db.query(checkSql, [user_id, product_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error checking cart' });

        if (result.length > 0) {
            // Product already in cart - update quantity
            const updateSql = 'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?';
            db.query(updateSql, [quantity, user_id, product_id], (err) => {
                if (err) return res.status(500).json({ message: 'Error updating cart' });
                res.json({ message: 'Cart updated successfully' });
            });
        } else {
            // Add new item to cart
            const insertSql = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
            db.query(insertSql, [user_id, product_id, quantity], (err) => {
                if (err) return res.status(500).json({ message: 'Error adding to cart' });
                res.status(201).json({ message: 'Product added to cart successfully' });
            });
        }
    });
};

// Get cart items
exports.getCart = (req, res) => {
    const user_id = req.user.id;

    const sql = `
        SELECT cart.id, cart.quantity,
               products.name AS product_name,
               products.price,
               products.image_url,
               (cart.quantity * products.price) AS total_price
        FROM cart
        JOIN products ON cart.product_id = products.id
        WHERE cart.user_id = ?
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error getting cart' });
        res.json(result);
    });
};

// Update cart item quantity
exports.updateCartItem = (req, res) => {
    const user_id = req.user.id;
    const cart_id = req.params.id;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const sql = 'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?';

    db.query(sql, [quantity, cart_id, user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating cart' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cart item not found' });
        res.json({ message: 'Cart item updated successfully' });
    });
};

// Remove item from cart
exports.removeFromCart = (req, res) => {
    const user_id = req.user.id;
    const cart_id = req.params.id;

    const sql = 'DELETE FROM cart WHERE id = ? AND user_id = ?';

    db.query(sql, [cart_id, user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error removing from cart' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cart item not found' });
        res.json({ message: 'Item removed from cart successfully' });
    });
};

// Clear cart
exports.clearCart = (req, res) => {
    const user_id = req.user.id;

    const sql = 'DELETE FROM cart WHERE user_id = ?';

    db.query(sql, [user_id], (err) => {
        if (err) return res.status(500).json({ message: 'Error clearing cart' });
        res.json({ message: 'Cart cleared successfully' });
    });
};