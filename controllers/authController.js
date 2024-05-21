// authController.js
exports.showRegister = function(req, res) {
  const errors = req.flash('error');
  const formData = req.flash('formData')[0];  // Retrieve it and store it immediately

  res.render('register', {
      error: errors.length > 0 ? errors[0] : null,
      formData: formData
  });
};


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

function checkBlank(fields) {
  return fields.some(field => field === '');
}

exports.showRegister = function (req, res) {
  res.render('register', {
      error: req.flash('error'),
      formData: req.flash('formData')[0] // Flash returns an array, get the first item
  });
};

exports.register = function (req, res) {
  const { registerEmail, registerPass, registerConfirmPass, registerName } = req.body;

  if (checkBlank([registerEmail, registerPass, registerConfirmPass, registerName])) {
      req.flash('error', 'All fields are required');
      req.flash('formData', req.body);
      console.log('All fields are required');
      res.redirect('/auth/register');
  } else if (!validateEmail(registerEmail)) {
      req.flash('error', 'Invalid email');
      req.flash('formData', req.body);
      console.log('Invalid email');
      res.redirect('/auth/register');
  } else if (registerPass !== registerConfirmPass) {
      req.flash('error', 'Passwords do not match');
      req.flash('formData', req.body);
      console.log('Passwords do not match');
      res.redirect('/auth/register');
  } else {
      const { isValid, message } = validatePassword(registerPass);
      if (!isValid) {
          req.flash('error', message);
          req.flash('formData', req.body);
          console.log(message);
          return res.redirect('/auth/register');
      } else {
          console.log('User created');
          res.redirect('/dashboard');
      }
  }
};
