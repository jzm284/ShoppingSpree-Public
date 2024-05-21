//called on a GET request to /register
exports.showRegister = function (req, res) {
  //render the register page
  res.render('register', { error: null, formData: null });
  //get the data from the form
  //validate the data
  //hash the password
  //create a new user
};


//called on a POST request to /register
exports.register = function (req, res) {
  const email = req.body.registerEmail;
  const password = req.body.registerPass;
  const confirmPassword = req.body.registerConfirmPass;
  const username = req.body.registerName;
  let { isValid: validPassword, message: invalidPassMsg } = validatePassword(password);
  if (checkBlank([email, password, confirmPassword, username])) {
    res.render('register', { error: 'All fields are required', formData: req.body });
  } else if (!validateEmail(email)) {
    res.render('register', { error: 'Invalid email', formData: req.body });
  } else if (password !== confirmPassword) {
    res.render('register', { error: 'Passwords do not match', formData: req.body });
  } else if (!validPassword) {
    res.render('register', { error: invalidPassMsg, formData: req.body });
    console.log('Invalid password')
  } else { //success
    console.log('User created')
    res.redirect('/dashboard');
  }
};

function checkBlank(fields) {
  return fields.some(field => field === '');
}

//credit to emailregex.com for the regex
function validateEmail(email) {
  var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}

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

exports.login = function (req, res) {
  res.send('Login');
};



