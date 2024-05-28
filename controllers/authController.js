// controllers/authController.js

const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../database/database');

/**
 * Function to show the register page, called on a GET request to /auth/register
 * @param {The request object} req 
 * @param {The response object} res 
 */
exports.showRegister = function (req, res) {
  const errors = req.flash('error');
  const formData = req.flash('formData')[0];

  res.render('register', {
    error: errors.length > 0 ? errors[0] : null,
    formData: formData
  });
};

/**
 * Function to show the login page, called on a GET request to /auth/login
 * @param {The request object} req 
 * @param {The response object} res
 */
exports.showLogin = function (req, res) {
  const errors = req.flash('error');
  const formData = req.flash('formData')[0];

  res.render('login', {
    error: errors.length > 0 ? errors[0] : null,
    formData: formData
  });
};

exports.register = async function (req, res) {
  const { registerEmail, registerPass, registerConfirmPass, registerName, userType } = req.body;

  //make sure all fields are filled out
  if (checkBlank([registerEmail, registerPass, registerConfirmPass, registerName])) {
    req.flash('error', 'All fields are required');
    req.flash('formData', req.body);
    return res.redirect('/auth/register');

    //ensure valid email
  } else if (!validateEmail(registerEmail)) {
    req.flash('error', 'Invalid email');
    req.flash('formData', req.body);
    return res.redirect('/auth/register');

    //ensure passwords match
  } else if (registerPass !== registerConfirmPass) {
    req.flash('error', 'Passwords do not match');
    req.flash('formData', req.body);
    return res.redirect('/auth/register');
  } else {
    const { isValid, message } = validatePassword(registerPass);

    //ensure password is strong enough
    if (!isValid) {
      req.flash('error', message);
      req.flash('formData', req.body);
      return res.redirect('/auth/register');

    } else {
      //check if user with this email already exists
      const user = await checkExistingUser(registerEmail);
      if (user) {
        req.flash('error', 'Account already exists with this email. Please log in or choose a different email.');
        req.flash('formData', req.body);
        return res.redirect('/auth/register');
      } else {
        //success case, create new user
        await createUser(registerEmail, registerPass, registerName, userType);
        req.session.loggedIn = true;
        return res.redirect('/dashboard');
      }
    }
  }
};


exports.login = async function (req, res) {
  const { loginEmail, loginPass } = req.body;

  // Check all fields are filled out
  if (checkBlank([loginEmail, loginPass])) {
    req.flash('error', 'All fields are required');
    req.flash('formData', req.body);
    console.log('All fields are required');
    return res.redirect('/auth/login');
  } else if (!validateEmail(loginEmail)) {
    req.flash('error', 'Please enter a valid email');
    req.flash('formData', req.body);
    console.log('Invalid email');
    return res.redirect('/auth/login');
  }

  try {
    // Check if user with this email exists
    const user = await checkExistingUser(loginEmail);
    if (!user) {
      req.flash('error', 'No user exists with this email. Please click "Sign Up" below');
      req.flash('formData', req.body);
      return res.redirect('/auth/login');
    }

    // Compare the hashed password
    const isMatch = await bcrypt.compare(loginPass, user.password);
    if (!isMatch) {
      req.flash('error', 'Incorrect password');
      req.flash('formData', req.body);
      return res.redirect('/auth/login');
    }

    // Update the last login time
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updateQuery = `UPDATE users SET lastLogin = ? WHERE email = ?`;
    await new Promise((resolve, reject) => {
      db.run(updateQuery, [date, loginEmail], (err) => {
        if (err) {
          console.error('Error updating last login', err);
          reject(err);
        } else {
          console.log('Last login updated');
          resolve();
        }
      });
    });
    req.session.loggedIn = true;
    return res.redirect('/dashboard');

  } catch (err) {
    console.error('Error during login process', err);
    req.flash('error', 'Error during login process. Please try again');
    req.flash('formData', req.body);
    return res.redirect('/auth/login');
  }
};


/*
Function to check for an existing user in the database
@param email - the email to check for
@return a Promise that resolves to true if the user exists, false otherwise
*/
async function checkExistingUser(email) {
  console.log('Checking for existing user:', email);

  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, email, (err, row) => {
      if (err) {
        console.error('Error checking for existing user', err);
        reject(err);
      } else {
        console.log(row);
        resolve(row);
      }
    });
  });
};


/*
Function to insert a new user into the database
@param email - the email of the new user
@param password - the password of the new user
@param name - the name of the new user
@param userType - the type of user (e.g. 'customer', 'owner')
@return a Promise that resolves when the user is inserted
*/
async function createUser(email, password, name, userType) {
  // Hash the password
  const hash = await bcrypt.hash(password, saltRounds);

  // Store the user in the database
  // Parameterized to avoid SQL injection attacks
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO users (email, password, username, userType, dateCreated, lastLogin) VALUES (?, ?, ?, ?, ?, ?)`;
    //credit to https://stackoverflow.com/questions/5129624 for the JS->SQL date formatting
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    db.run(query, [email, hash, name, userType, date, date], (err) => {
      if (err) {
        console.error('Error inserting user', err);
        reject(err);
      } else {
        console.log('User inserted');
        resolve();
      }
    });
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
