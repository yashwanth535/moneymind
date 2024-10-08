require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the user schema
const userSchema = new mongoose.Schema({
  email: String,
  pass: String
});

// Create the User model
const User = mongoose.model('User', userSchema, 'users');

// Export the User model
module.exports = User;
