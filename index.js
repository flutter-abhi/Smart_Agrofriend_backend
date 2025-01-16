const express = require('express');
const app = express();
const port = process.env.PORT;

// Middleware to handle JSON requests
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
