const db = require('../db');

// Create order
exports.createOrder = (req, res) => {
    const user_id = req.user.id;
    const { items } = req.body;

    // items: [{ product_id: 1, quantity: 2 }, ...]
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items provided' });
    }

    // 1. First create the order
    const orderSql = 'INSERT INTO orders (user_id) VALUES (?)';

    db.query(orderSql, [user_id], (err, orderResult) => {
        if (err) return res.status(500).json({ message: 'Error creating order' });

        const orderId = orderResult.insertId;

        // 2. Get price for each product from database
        const productIds = items.map(item => item.product_id);
        const productSql = 'SELECT id, price FROM products WHERE id IN (?)';

        db.query(productSql, [productIds], (err, products) => {
            if (err) return res.status(500).json({ message: 'Error getting products' });

            // 3. Add items to order_items
            const orderItems = items.map(item => {
                const product = products.find(p => p.id === item.product_id);
                return [orderId, item.product_id, item.quantity, product.price];
            });

            const itemsSql = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';

            db.query(itemsSql, [orderItems], (err) => {
                if (err) return res.status(500).json({ message: 'Error adding order items' });

                res.status(201).json({
                    message: 'Order created successfully',
                    orderId
                });
            });
        });
    });
};

// Get own orders
exports.getMyOrders = (req, res) => {
    const user_id = req.user.id;

    const sql = `
        SELECT orders.id, orders.status, orders.created_at,
               order_items.quantity, order_items.price,
               products.name AS product_name
        FROM orders
        JOIN order_items ON orders.id = order_items.order_id
        JOIN products ON order_items.product_id = products.id
        WHERE orders.user_id = ?
        ORDER BY orders.created_at DESC
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error getting orders' });
        res.json(result);
    });
};

// Admin - get all orders
exports.getAllOrders = (req, res) => {
    const sql = `
        SELECT orders.id, orders.status, orders.created_at,
               users.name AS user_name, users.email,
               order_items.quantity, order_items.price,
               products.name AS product_name
        FROM orders
        JOIN users ON orders.user_id = users.id
        JOIN order_items ON orders.id = order_items.order_id
        JOIN products ON order_items.product_id = products.id
        ORDER BY orders.created_at DESC
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error getting orders' });
        res.json(result);
    });
};

// Admin - update order status
exports.updateOrderStatus = (req, res) => {
    const id = req.params.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const sql = 'UPDATE orders SET status = ? WHERE id = ?';

    db.query(sql, [status, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating order' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order status updated successfully' });
    });
};