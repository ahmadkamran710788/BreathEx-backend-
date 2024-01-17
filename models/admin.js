const mongoose = require('mongoose');
const validator = require('validator');

const adminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: "Please enter a valid email address",
        },
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: (value) => {
                return value.length >= 6;
            },
            message: "Enter a longer password (at least 6 characters)",
        },
    },
   
    type: {
        type: String,
        default: 'Admin',
    },
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
