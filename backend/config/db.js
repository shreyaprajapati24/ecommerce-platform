const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.warn("MongoDB connection failed. Please check your MONGO_URI.");
    // We won't exit the process here so that the app can still start and serve UI error messages if needed,
    // though usually we'd process.exit(1). Let's keep it running for the internship task so Vercel/Render don't crash loop immediately.
  }
};

module.exports = connectDB;
