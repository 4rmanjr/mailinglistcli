const express = require('express');
const sqlite3 = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3(path.join(__dirname, 'api/database.sqlite'));

app.use(cors());
app.use(express.json());

// Ensure tables exist
db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT,
        alamat TEXT,
        kota TEXT,
        kode_pos TEXT,
        telepon TEXT,
        email TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS letters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomor TEXT,
        tanggal TEXT,
        perihal TEXT,
        customer_id INTEGER,
        customer_nama TEXT,
        total_tunggakan TEXT,
        total_tagihan INTEGER,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

app.get('/api/customers', (req, res) => {
    const rows = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
    res.json({ success: true, data: rows });
});

app.post('/api/customers', (req, res) => {
    const { nama, alamat, kota, kode_pos, telepon, email, status } = req.body;
    const stmt = db.prepare('INSERT INTO customers (nama, alamat, kota, kode_pos, telepon, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(nama, alamat, kota, kode_pos, telepon, email, status);
    res.json({ success: true, data: { id: result.lastInsertRowid, ...req.body } });
});

app.get('/api/letters', (req, res) => {
    const rows = db.prepare('SELECT * FROM letters ORDER BY created_at DESC').all();
    res.json({ success: true, data: rows });
});

app.post('/api/letters', (req, res) => {
    const { nomor, tanggal, perihal, customer_id, customer_nama, total_tunggakan, total_tagihan, status } = req.body;
    const stmt = db.prepare('INSERT INTO letters (nomor, tanggal, perihal, customer_id, customer_nama, total_tunggakan, total_tagihan, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(nomor, tanggal, perihal, customer_id, customer_nama, total_tunggakan, total_tagihan, status);
    res.json({ success: true, data: { id: result.lastInsertRowid.toString(), ...req.body } });
});

app.listen(8000, () => {
    console.log('Test Server running at http://localhost:8000');
});
