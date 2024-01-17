const mongoose = require('mongoose');
const validator = require('validator');

const doctorSchema = mongoose.Schema({

   
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
   
   
    description: {
        type: String,
        required: true,
        trim:true,
        
    },
    images:[{
        type:String,
        required:true,
        
    }],

    
    
    phone: {
        type: String,
        required:true
    },
    
    specialization: {
        type: String,
        required:true
    },

    medicalliecensenumber: {
        type: String,
        required:true
    },
    
    gender: {
        type: String,
        required:true
    },

    availableOnlineHours:{
        Monday: {
            type: [String],
            default: []
        },
        Tuesday: {
            type: [String],
            default: []
        },
        Wednesdy: {
            type: [String],
            default: []
        },
        Thursday: {
            type: [String],
            default: []
        },
        Friday: {
            type: [String],
            default: []
        },
        Saturday: {
            type: [String],
            default: []
        },
        Sunday: {
            type: [String],
            default: []
        },
    },
    star:{
        type:Number,
        default:0
    },

    type: {
        type: String,
        default: 'Doctor',
    },




    
    


})

const Doctor = mongoose.model('Doctor', doctorSchema);
    module.exports = Doctor;