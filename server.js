const express = require("express");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());

// Categories
app.get("/categories", (req, res) => {
  db.query("SELECT * FROM categories", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/categories", (req, res) => {
  const { name } = req.body;
  db.query("INSERT INTO categories (name) VALUES (?)", [name], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, name });
  });
});

app.put("/categories/:id", (req, res) => {
  const { name } = req.body;
  db.query("UPDATE categories SET name = ? WHERE id = ?", [name, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Updated" });
  });
});

app.delete("/categories/:id", (req, res) => {
  db.query("DELETE FROM categories WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});

// Products
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/products", (req, res) => {
  const { name, price, category_id } = req.body;
  db.query("INSERT INTO products (name, price, category_id) VALUES (?, ?, ?)", [name, price, category_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, name, price, category_id });
  });
});

app.put("/products/:id", (req, res) => {
  const { name, price, category_id } = req.body;
  db.query("UPDATE products SET name = ?, price = ?, category_id = ? WHERE id = ?", [name, price, category_id, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Updated" });
  });
});

app.delete("/products/:id", (req, res) => {
  db.query("DELETE FROM products WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});