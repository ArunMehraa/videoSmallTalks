const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true,
    },
    pic : {
        type: String,
        default: "https://www.google.com/url?sa=i&url=https%3A%2F%2Ficon-library.com%2Ficon%2Fdefault-profile-icon-24.html&psig=AOvVaw3XfFYGHeuJpUIOfAIridVM&ust=1694009424421000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCJD59oLTk4EDFQAAAAAdAAAAABAD",
    },
},
    { timestamps: true }
);

userModel.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password);
}

userModel.pre('save', async function(next) {
    if(!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userModel);

module.exports = User;