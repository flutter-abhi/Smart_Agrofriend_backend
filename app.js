const express = require('express');
const app = express();

const dotenv = require('dotenv').config();

const port = process.env.PORT;
const router = require('./routs/router');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/mongodbConfig');

connectDB();


// Middleware to handle JSON requests
app.use(cookieParser());
app.use(express.json());
app.use('/api', router);


// Basic route
app.get('/', (req, res) => {
    res.status(200).json({
        msg: "hellow"
    })
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
