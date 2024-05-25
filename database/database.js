var sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});


const query =
    `CREATE TABLE IF NOT EXISTS users 
    (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    userType TEXT,
    dateCreated DATE,
    lastLogin DATE
    )`;

db.serialize(() => {
    db.run(query, (err) => {
        if (err) {
            console.error('Error creating table', err.message);
        } else {
            console.log('Table created successfully');
        }
    });
});

module.exports = db;