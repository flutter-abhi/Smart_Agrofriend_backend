const USER = require('../schema/lalitSchema');  // Import the user model
const crypto = require('crypto');                // To generate OTP
const axios = require('axios');                  // For sending HTTP requests

let otpStorage = {};  // Temporary storage for OTPs (Use Redis in production)

// Function to generate OTP and expiration time
const generateOtp = () => {
    return {
        otp: crypto.randomInt(100000, 999999).toString(),  // 6-digit OTP
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),   // OTP expires in 5 minutes
    };
};

// Function to send OTP using Fast2SMS API
const sendOtp = async (mobNumber, otp) => {
    try {
        const url = 'https://www.fast2sms.com/dev/bulkV2';
        const authorizationToken = 'il3UKqldKVCfbt0QAHUXC3c3BELxZEDkUOgo6sJZVbLLDU9C1GJ75RG6H0sW';

        const params = {
            authorization: authorizationToken,
            route: 'otp',
            variables_values: otp,
            numbers: mobNumber,
        };

        const response = await axios.get(url, { params });
        if (response.status === 200) {
            console.log(`OTP sent successfully to ${mobNumber}`);
        } else {
            console.error('Failed to send OTP:', response.data);
        }
    } catch (error) {
        console.error('Error sending OTP via Fast2SMS:', error);
        throw new Error('Error sending OTP');
    }
};

// *Signup Controller (Only sends OTP)*
const signupcontroller = async (req, res) => {
    try {
        console.log("Signup request received:", req.body);

        const { mobNumber } = req.body;

        // Check if user already exists
        const existingUser = await USER.findOne({ mobNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists try login with pin' });
        }


        // Generate OTP and expiration time
        const { otp, expiresAt } = generateOtp();

        // Store OTP temporarily (Use Redis in production)
        otpStorage[mobNumber] = { otp, expiresAt };


        // Send OTP
        await sendOtp(mobNumber, otp);

        // Return success response
        return res.status(200).json({
            message: 'OTP sent successfully. Please check your phone.',
            mobNumber,  // Return the mobile number (to verify OTP later)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
};

// *OTP Verification Controller (Registers User with PIN)*
exports.verifyOtpController = async (req, res) => {
    try {
        const { mobNumber, otp, name, state, district, taluka, village, pin } = req.body;

        // Validate pin (must be a 4-digit number)
        if (!/^\d{4}$/.test(pin)) {
            return res.status(400).json({ message: 'PIN must be a 4-digit number' });
        }

        // Check if OTP exists in memory (this is where Redis would come in for better persistence)
        const storedOtpData = otpStorage[mobNumber];

        if (!storedOtpData) {
            return res.status(400).json({ message: 'OTP not generated or expired' });
        }

        // Check if OTP has expired
        if (new Date() > storedOtpData.expiresAt) {
            delete otpStorage[mobNumber];  // Delete expired OTP
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Verify OTP
        if (storedOtpData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP is correct and not expired, now save user to the database
        const newUser = new USER({
            name,
            mobNumber,
            state,
            district,
            taluka,
            village,
            pin, // Store 4-digit PIN for login
        });

        await newUser.save();

        // OTP verification success
        delete otpStorage[mobNumber];  // Clean up OTP after successful verification

        return res.status(200).json({
            message: 'OTP verified successfully. User registered.',
            userId: newUser._id,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
};



// *Login Controller (Authenticate User with PIN)*
exports.loginController = async (req, res) => {
    try {
        const { mobNumber, pin } = req.body;

        // Validate request
        if (!mobNumber || !pin) {
            return res.status(400).json({ message: 'Mobile number and PIN are required' });
        }

        // Find user by mobile number
        const user = await USER.findOne({ mobNumber });

        if (!user) {
            return res.status(400).json({ message: 'User not found. Please sign up first.' });
        }

        // Check if entered PIN matches the stored PIN
        if (user.pin !== pin) {
            return res.status(400).json({ message: 'Invalid PIN. Please try again.' });
        }

        // Successful login
        return res.status(200).json({
            message: 'Login successful!',
            userId: user._id,  // Returning user ID (optional)
            name: user.name,
            mobNumber: user.mobNumber,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
};


module.exports = {
    signupcontroller
};