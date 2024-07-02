// utils/auth.js

const admin = require('firebase-admin');

function checkAuth(req, res, next) {
  const token = req.cookies.token || '';

  if (token) {
    admin.auth().verifyIdToken(token)
      .then((decodedToken) => {
        // Check if user is an admin (example: assuming 'admin' role)
        if (decodedToken.admin === true) {
          req.user = decodedToken; // Optional: You can store user information in req.user
          next(); // User is authorized, proceed to the next middleware/route
        } else {
          res.redirect('/login'); // User is logged in but not authorized
        }
      })
      .catch(() => {
        res.redirect('/login'); // Invalid token or not logged in
      });
  } else {
    res.redirect('/login'); // No token found, user needs to log in
  }
}

module.exports = { checkAuth };
