const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const userRoutes = require('./routes/UserR')
const connectDB = require('./config/database');
require('dotenv').config;

connectDB();

app.set('trust proxy', true);

app.use(bodyParser.json());
app.use(express.json());
app.use('/api',userRoutes);

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message || 'An unexpected error occurred',
    });
});

  
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`I am running on http://localhost:${PORT}`);
});