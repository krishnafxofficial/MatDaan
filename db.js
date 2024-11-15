const mongoose = require('mongoose');
require('dotenv').config();

// Define the mongoDB connection URL.
const mongoURL = process.env.MONGODB_URL_LOCAL // Replace 'mydatabase' with your database name.
//const mongoURL = process.env.MONGODB_URL;
// Setup mongoDB connection
mongoose.connect(mongoURL, {
    useNewUrlParser : true,
    useUnifiedTopology : true 
})

// Get the Default connection
// Mongoose maintains a default connection object representing the MongoDB connection
const db = mongoose.connection;

// Event Listeners
db.on('connected', () => {
   console.log("Connected to MongoDB server");
})
db.on('error', (err) => {
    console.log("MongoDB connection error:",err);
 })
 db.on('disconnected', () => {
    console.log(" MongoDB server Disconnected");
 })

 // Export the Database connection
 module.exports = db;