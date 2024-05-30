const express = require('express');
const app = express();
const port = 3000;
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', httpOnly: true, maxAge: 3600000}
}));

app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('home');
    });

// Route handling
const authRoutes = require('./routes/authRoute');
app.use('/auth', authRoutes);

const dashRoutes = require('./routes/dashRoute');
app.use('/dashboard', dashRoutes); 

const apiRoutes = require('./routes/apiRoute');
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
