const User = require('../schema/UserSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


dotenv.config();

// Helper function to generate JWT token
const generateJWT = (userId, role) => {
  const payload = { userId, role };
  const secretKey = process.env.JWT_SECRET || 'your_secret_key'; // Use a secure key
  const options = { expiresIn: '36h' }; // Token expires in 36 hours
  return jwt.sign(payload, secretKey, options);
};

// **Signup Controller**
const signupController = async (req, res) => {
  const { name, phoneNumber, role, password, village, district, taluka, state } = req.body;

  console.log("Signup Request:", req.body);

  try {
    // Check if the user already exists using phoneNumber
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password (if provided)
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // Hash password using bcrypt
    }

    // Create and save the user in the database
    const newUser = new User({
      fullName: name,
      phoneNumber,
      role,
      password: hashedPassword, // Store hashed password
      location: {
        village,
        district,
        taluka,
        state,
      },
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = generateJWT(savedUser._id, savedUser.role);

    // Set JWT token as an HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true, // Prevents client-side script access
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'strict', // Protect against CSRF
      maxAge: 3600000, // 1 hour in milliseconds
    });

    // Respond with success and user data
    res.status(201).json({
      user: savedUser,
      message: 'User signed up successfully',
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: 'Error signing up', error: error.message });
  }
};

// **Login Controller**
const loginController = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    // Generate JWT token
    const token = generateJWT(user._id, user.role);

    // Set JWT token as an HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true, // Prevents client-side script access
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'strict', // Protect against CSRF
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });

    // Respond with success and user info
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { signupController, loginController };
