const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();    

// Middleware to verify JWT token from cookies
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(403).json({ message: 'Access denied, token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user.id = user.id; // Add user data to the request object
    req.user.role = user.role; // Add user data to the request object
    next();
  });
};

module.exports = authenticateJWT;
