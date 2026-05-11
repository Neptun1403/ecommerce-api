require('dotenv').config();
const express = require('express');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
    console.log('METHOD:', req.method);
    console.log('URL:', req.url);
    console.log('BODY:', req.body);
    next();
});

app.get('/', (req, res) => {
    res.send('E-commerce API is running');
});

app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/', authRoutes);
app.use('/cart', cartRoutes);
app.use('/users', userRoutes);

app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});
