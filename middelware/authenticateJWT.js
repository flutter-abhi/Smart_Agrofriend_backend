const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Middleware to verify JWT token from cookies
const authenticateJWT = (req, res, next) => {

  const token = req.cookies.jwt; // Ensure the cookie name matches the one set in loginController
  console.log(req.cookies);
  if (!token) {
    return res.status(403).json({ message: 'Access denied, token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = user; // Initialize req.user and set it directly to the decoded user object
    next();
  });

};

module.exports = authenticateJWT;
