const mongoose = require('mongoose');
const url = process.env.MONGO_URI;
const connectDB = async () => {
    try{
        const conn = await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline);
    }
    catch(error) {
        
        console.log(`Error: ${error.message}`.red.underline.bold);
        process.exit(1);
    }
};

module.exports = connectDB;