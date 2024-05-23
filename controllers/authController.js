// authController.js

const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../database/database');

exports.showRegister = function (req, res) {
  const errors = req.flash('error');
  const formData = req.flash('formData')[0];

  res.render('register', {
    error: errors.length > 0 ? errors[0] : null,
    formData: formData
  });
};

exports.showLogin = function (req, res) {
  const errors = req.flash('error');
  const formData = req.flash('formData')[0];

  res.render('index', {
    error: errors.length > 0 ? errors[0] : null,
    formData: formData
  });
};

exports.register = function (req, res) {
  const { registerEmail, registerPass, registerConfirmPass, registerName, userType } = req.body;

  //make sure all fields are filled out
  if (checkBlank([registerEmail, registerPass, registerConfirmPass, registerName])) {
    req.flash('error', 'All fields are required');
    req.flash('formData', req.body);
    console.log('All fields are required');
    return res.redirect('/auth/register');

  //ensure valid email
  } else if (!validateEmail(registerEmail)) {
    req.flash('error', 'Invalid email');
    req.flash('formData', req.body);
    console.log('Invalid email');
    return res.redirect('/auth/register');

  //ensure passwords match
  } else if (registerPass !== registerConfirmPass) {
    req.flash('error', 'Passwords do not match');
    req.flash('formData', req.body);
    console.log('Passwords do not match');
    return res.redirect('/auth/register');
  } else {
    const { isValid, message } = validatePassword(registerPass);

    //ensure password is strong enough
    if (!isValid) {
      req.flash('error', message);
      req.flash('formData', req.body);
      console.log(message);
      return res.redirect('/auth/register');
  
    } else {
      //check if user with this email already exists
      const exists = checkExistingUser(registerEmail);
      if (exists) {
        req.flash('error', 'User already exists with this email');
        req.flash('formData', req.body);
        console.log('User already exists');
        return res.redirect('/auth/register');
      } else { 
      //success case, create new user
      createUser(registerEmail, registerPass, registerName, userType);
      console.log('User created');
      return res.redirect('/dashboard');
      }
    }
  }
};

exports.login = function (req, res) {
  const { loginEmail, loginPass } = req.body;

  //make sure all fields are filled out
  if (checkBlank([loginEmail, loginPass])) {
    req.flash('error', 'All fields are required');
    req.flash('formData', req.body);
    console.log('All fields are required');
    return res.redirect('/auth/login');
  } else {
    //check if user with this email exists
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [loginEmail], (err, row) => {
      if (err) {
        console.error('Error checking for existing user', err);
        req.flash('error', 'Error checking for existing user');
        req.flash('formData', req.body);
        return res.redirect('/auth/login');
      } else {
        if (row === undefined) {
          req.flash('error', 'User does not exist with this email');
          req.flash('formData', req.body);
          console.log('User does not exist with this email');
          return res.redirect('/auth/login');
        } else {
          //compare the hashed password
          bcrypt.compare(loginPass, row.password, function (err, result) {
            if (err) {
              console.error('Error comparing passwords', err);
              req.flash('error', 'Error comparing passwords');
              req.flash('formData', req.body);
              return res.redirect('/auth/login');
            } else {
              if (result) {
                //update the last login time
                const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
                const updateQuery = `UPDATE users SET lastLogin = ? WHERE email = ?`;
                db.run(updateQuery, [date, loginEmail], (err) => {
                  if (err) {
                    console.error('Error updating last login', err);
                  } else {
                    console.log('Last login updated');
                  }
                });
                return res.redirect('/dashboard');
              } else {
                req.flash('error', 'Incorrect password');
                req.flash('formData', req.body);
                console.log('Incorrect password');
                return res.redirect('/auth/login');
              }
            }
          });
        }
      }
    });
  }
}

//check if a user with this email already exists
function checkExistingUser(email) {
  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], (err, row) => {
    if (err) {
      console.error('Error checking for existing user', err);
      return false;
    } else {
      return row !== undefined;
    }
  });
}

//enter a new user into the database
function createUser(email, password, name, userType) {
  // Hash the password
  bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
      console.error('Error hashing password', err);
    } else {
      // Store the user in the database
      // Parameterized to avoid SQL injection attacks
      const query = `INSERT INTO users (email, password, username, userType, dateCreated, lastLogin) VALUES (?, ?, ?, ?, ?, ?)`;

      //credit to https://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime for the JS->SQL date formatting
      const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
      db.run(query, [email, hash, name, userType, date, date], (err) => {
        if (err) {
          console.error('Error inserting user', err);
        } else {
          console.log('User inserted');
        }
      });
    }
  });
};

//credit to emailregex.com for the regex
function validateEmail(email) {
  var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}

//ensure the user's password is strong enough
function validatePassword(password) {
  let isValid = true;
  let message = null;

  if (password.length < 8) {
    isValid = false;
    message = 'Password must be at least 8 characters long';
  } else if (!/[a-z]/.test(password)) {
    isValid = false;
    message = 'Password must contain at least one lowercase letter';
  } else if (!/[A-Z]/.test(password)) {
    isValid = false;
    message = 'Password must contain at least one uppercase letter';
  } else if (!/[0-9]/.test(password)) {
    isValid = false;
    message = 'Password must contain at least one number';
  } else {
    console.log('Password is valid');
  }

  return { isValid, message };
}

function checkBlank(fields) {
  return fields.some(field => field === '');
}
