var sqlite3 = require('sqlite3').verbose();

//SQLite database connection
const db = new sqlite3.Database('./database/database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

//our user table schema
const user_query =
    `CREATE TABLE IF NOT EXISTS users 
    (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    userType TEXT,
    dateCreated DATE,
    lastLogin DATE
    )`;

//grocery list table schema (for customers)
    const list_query = `
    CREATE TABLE IF NOT EXISTS lists
    (
    list_id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER,
    email TEXT,
    dateCreated DATE,
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    FOREIGN KEY (email) REFERENCES users(email)
    )`;

//grocery store table schema (for store owners)
//layout is a JSON object that stores the layout of the store
const store_query =
    `CREATE TABLE IF NOT EXISTS stores
    (
    store_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    address TEXT,
    layout TEXT,
    public BOOLEAN
    )`;

db.serialize(() => {
    db.run(user_query, (err) => {
        if (err) {
            console.error('Error creating table', err.message);
        } else {
            console.log('Table created successfully (users)');
        }
    });
    db.run(store_query, (err) => {
        if (err) {
            console.error('Error creating stores table', err.message);
        } else {
            console.log('Table created successfully (stores)');
        }
    });
    db.run(list_query, (err) => {
        if (err) {
            console.error('Error creating lists table', err.message);
        } else {
            console.log('Table created successfully (lists)');
        }
    });
});

module.exports = db;