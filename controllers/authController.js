// controllers/authController.js

const bcrypt = require("bcrypt");
const saltRounds = 10;
const db = require("../database/database");

/**
 * Function to show the register page, called on a GET request to /auth/register
 * @param {The HTTP request object} req
 * @param {The HTTP response object} res
 */
exports.showRegister = function (req, res) {
  if (req.session.loggedIn) {
    return res.redirect("/dashboard");
  }
  const errors = req.flash("error");
  const formData = req.flash("formData")[0];

  res.render("register", {
    error: errors.length > 0 ? errors[0] : null,
    formData: formData,
  });
};

/**
 * Function to show the login page, called on a GET request to /auth/login
 * @param {The HTTP request object} req
 * @param {The HTTP response object} res
 */
exports.showLogin = function (req, res) {
  if (req.session.loggedIn) {
    return res.redirect("/dashboard");
  }
  const errors = req.flash("error");
  const formData = req.flash("formData")[0];

  res.render("login", {
    error: errors.length > 0 ? errors[0] : null,
    formData: formData,
  });
};


/**
 * Function to validate an email address
 * credit to emailregex.com for the regex
 * @param {The email address to validate} email
 * @returns {true if the email is valid, else false}
 */
function validateEmail(email) {
  var regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}

/**
 * Function to ensure strength of a user's password
 * @param {The password to validate} password
 * @returns {JSON object - {isValid: boolean, message: string}
 * where isValid is true if the password passes all checks, else false,
 * and message is a string with the reason the password is invalid (null if valid)}
 */
function validatePassword(password) {
  let isValid = true;
  let message = null;

  if (password.length < 8) {
    isValid = false;
    message = "Password must be at least 8 characters long";
  } else if (!/[a-z]/.test(password)) {
    isValid = false;
    message = "Password must contain at least one lowercase letter";
  } else if (!/[A-Z]/.test(password)) {
    isValid = false;
    message = "Password must contain at least one uppercase letter";
  } else if (!/[0-9]/.test(password)) {
    isValid = false;
    message = "Password must contain at least one number";
  } //else the password is valid and message is null

  return { isValid, message };
}

/**
 * Function to register a new user, called on a POST request to /auth/register
 * @param {The HTTP request object} req
 * @param {The HTTP response object} res
 * @returns
 */
exports.register = async function (req, res) {
  const {
    registerEmail,
    registerPass,
    registerConfirmPass,
    registerName,
    userType,
  } = req.body;

  //make sure all fields are filled out
  if (
    checkBlank([registerEmail, registerPass, registerConfirmPass, registerName])
  ) {
    req.flash("error", "All fields are required");
    req.flash("formData", req.body);
    return res.redirect("/auth/register");

    //ensure valid email
  } else if (!validateEmail(registerEmail)) {
    req.flash("error", "Invalid email");
    req.flash("formData", req.body);
    return res.redirect("/auth/register");

    //ensure passwords match
  } else if (registerPass !== registerConfirmPass) {
    req.flash("error", "Passwords do not match");
    req.flash("formData", req.body);
    return res.redirect("/auth/register");
  } else {
    const { isValid, message } = validatePassword(registerPass);

    //ensure password is strong enough
    if (!isValid) {
      req.flash("error", message);
      req.flash("formData", req.body);
      return res.redirect("/auth/register");
    } else {
      //check if user with this email already exists
      const user = await checkExistingUser(registerEmail);
      if (user) {
        req.flash(
          "error",
          "Account already exists with this email. Please log in or choose a different email."
        );
        req.flash("formData", req.body);
        return res.redirect("/auth/register");
      } else {
        //success case, create new user
        await createUser(registerEmail, registerPass, registerName, userType);
        req.session.loggedIn = true;
        req.session.user = { email: registerEmail };
        return res.redirect("/dashboard");
      }
    }
  }
};

/**
 * Function to log in a user, called on a POST request to /auth/login
 * @param {The HTTP request object} req
 * @param {The HTTP response object} res
 * @returns {redirects to /dashboard on successful login, else to /auth/login with an error message}
 */
exports.login = async function (req, res) {
  const { loginEmail, loginPass } = req.body;

  // Check all fields are filled out
  if (checkBlank([loginEmail, loginPass])) {
    req.flash("error", "All fields are required");
    req.flash("formData", req.body);
    return res.redirect("/auth/login");
  } else if (!validateEmail(loginEmail)) {
    req.flash("error", "Please enter a valid email");
    req.flash("formData", req.body);
    return res.redirect("/auth/login");
  }
  try {
    // Check if user with this email exists
    const user = await checkExistingUser(loginEmail);
    if (!user) {
      req.flash(
        "error",
        'No user exists with this email. Please click "Sign Up" below'
      );
      req.flash("formData", req.body);
      return res.redirect("/auth/login");
    }
    // Compare the hashed password
    const isMatch = await bcrypt.compare(loginPass, user.password);
    if (!isMatch) {
      req.flash("error", "Incorrect password");
      req.flash("formData", req.body);
      return res.redirect("/auth/login");
    }
    // Update the last login time
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const updateQuery = `UPDATE users SET lastLogin = ? WHERE email = ?`;
    await new Promise((resolve, reject) => {
      db.run(updateQuery, [date, loginEmail], (err) => {
        if (err) {
          console.error("Error updating last login", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
    //regenerate session cookie on successful login
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).send("Internal server error");
      }
      req.session.loggedIn = true;
      req.session.user = { email: loginEmail };
      return res.redirect("/dashboard");
    });
  } catch (err) {
    console.error("Error during login process", err);
    req.flash("error", "Error during login process. Please try again");
    req.flash("formData", req.body);
    return res.redirect("/auth/login");
  }
};

/**
 *
 * @param {The user's email to check in the database} email
 * @returns {the row from the database if the user exists, else null}
 */
async function checkExistingUser(email) {

  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, email, (err, row) => {
      if (err) {
        console.error("Error checking for existing user", err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Function to create a new user in the database
 * @param {The user's email} email
 * @param {The user's password (unhashed)} password
 * @param {The user's name} name
 * @param {The user's type} userType
 * @returns {A promise that resolves when the user is inserted into the database}
 */
async function createUser(email, password, name, userType) {
  // Hash the password
  const hash = await bcrypt.hash(password, saltRounds);

  // Store the user in the database
  // Parameterized to avoid SQL injection attacks
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO users (email, password, name, userType, dateCreated, lastLogin) VALUES (?, ?, ?, ?, ?, ?)`;
    //credit to https://stackoverflow.com/questions/5129624 for the JS->SQL date formatting
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    db.run(query, [email, hash, name, userType, date, date], (err) => {
      if (err) {
        console.error("Error inserting user", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


/**
 * Function to check that no fields are blank
 * @param {Array of fields to check (formData)} fields
 * @returns {true if any fields are blank, else false}
 */
function checkBlank(fields) {
  return fields.some((field) => field === "");
}


/**
 * A function to change the user's password
 * @param {The HTTP request object} req 
 * @param {The HTTP response object} res 
 * @returns {redirects to /dashboard on successful password change}
 */
exports.changePassword = async function (req, res) {
  const { oldPass, newPass, confirmPass } = req.body;
  const user = req.session.user;

  if (!user) {
    return res.json({ error: 'Please log in first.' });
  }

  if (checkBlank([oldPass, newPass, confirmPass])) {
    return res.json({ error: 'All fields are required' });
  }
  if (user.email === 'test@test.com') {
    return res.json({ error: 'Cannot change password for test account' });
  }

  if (newPass !== confirmPass) {
    return res.json({ error: 'Passwords do not match' });
  }

  if (oldPass === newPass) {
    return res.json({ error: 'New password cannot be the same as the old password' });
  }

  const { isValid, message } = auth.validatePassword(newPass);
  if (!isValid) {
    return res.json({ error: message });
  }

  try {
    const accDetails = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, user.email, (err, row) => {
        if (err) {
          console.error("Error checking for existing user", err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    const isValidPass = await bcrypt.compare(oldPass, accDetails.password, (err, result) => {
      if (err) {
        console.error("Error comparing passwords", err);
        return false;
      }
      return result;
    });
    if (!isValidPass) {
      return res.json({ error: 'Old password is incorrect.' });
    }
  } catch (error) {
    console.error("Error checking old password", error);
    return res.json({ error: 'An error occurred while changing the password' });
  }

  try {
    const hashedPass = await bcrypt.hash(newPass, 10);

    const updateQuery = `UPDATE users SET password = ? WHERE email = ?`;
    await new Promise((resolve, reject) => {
      db.run(updateQuery, [hashedPass, user.email], (err) => {
        if (err) {
          console.error("Error updating password", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return res.json({ success: 'Password successfully changed' });
  } catch (error) {
    console.error("Error updating password", error);
    return res.json({ error: 'An error occurred while changing the password' });
  }
};

/**
 * Function to log out a user
 * @param {The HTTP request object} req
 * @param {The HTTP response object} res
 * @returns {redirects to /auth/login}
 */
exports.logout = function (req, res) {
  req.session.destroy();
  res.redirect("/auth/login");
}

exports.validatePassword = validatePassword;