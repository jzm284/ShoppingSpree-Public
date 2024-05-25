const express = require('express');
const app = express();
const port = 3000;
const session = require('express-session');
const flash = require('connect-flash');

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(session({
  secret: 'thisIstheSecretKeyForNowyoUKnowIt',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' }
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

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
