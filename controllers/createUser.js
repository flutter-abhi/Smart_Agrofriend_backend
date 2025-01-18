
const User = require('../schema/UserSchema');
const LaborFarmerProfile = require('../schema/Labour_FarmerSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


// Helper function to generate JWT token
const generateJWT = (userId, role) => {
  const payload = { userId, role };
  const secretKey = process.env.JWT_SECRET || 'your_secret_key'; // Use a secret key from environment variables for security
  const options = { expiresIn: '1h' }; // Token expires in 1 hour
  return jwt.sign(payload, secretKey, options);
};

// Signup Controller
const signupController = async (req, res) => {
  const { email, googleId, role, password } = req.body;
  console.log("signupController", req.body);

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password if it's not from Google authentication
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // Hashing the password
    }

    // Create and save the user to the database
    const newUser = new User({
      email,
      googleId,
      role,
      password: hashedPassword, // Store hashed password for normal authentication
    });

    const savedUser = await newUser.save();

    // Create and save the user profile (LaborFarmerProfile or other roles)
    const newProfile = new LaborFarmerProfile({
      userId: savedUser._id,
      role: role, // Role (e.g., 'laborer' or 'farmer')
    });

    const savedProfile = await newProfile.save();

    // Generate JWT token
    const token = generateJWT(savedUser._id, savedUser.role);

    // Set the JWT token as an HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true, // Prevent JavaScript access to the token
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 3600000, // Token expires in 1 hour
    });

    // Send response with user and profile data
    res.status(201).json({
      user: savedUser,
      profile: savedProfile,
      message: 'User signed up successfully',
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error signing up', error: error.message });
  }
};

const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Set token as a cookie (httpOnly for security)
    res.cookie('jwt', token, {
      httpOnly: true, // Prevents client-side scripts from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Secure flag for HTTPS in production
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });

    // Respond with success and user info
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { signupController, loginController };
