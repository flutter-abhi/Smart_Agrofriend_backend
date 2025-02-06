const express = require('express');
const app = express();
require('./controllers/jobCron'); // Adjust the path to your cron job file


const dotenv = require('dotenv').config();

const port = process.env.PORT;
const router = require('./routs/router');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/mongodbConfig');

connectDB();


// Middleware to handle JSON requests
app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
    if (process.env.APP_MAINTENANCE_MODE === "true") {
        return res.status(503).send("🚧 Service is temporarily paused. Check back soon! 🚧");
    }
    next();
});

app.use('/api', router);


// Basic route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/default.html'); // Send the HTML file
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
