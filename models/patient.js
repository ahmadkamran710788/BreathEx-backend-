const mongoose = require('mongoose');
const validator = require('validator');

const patientSchema = mongoose.Schema({
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
    medicalhistory: {
        type: String,
        default: '',
    },


      images:[{
        type:String,
        required:true,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
        
    }],

      


    phonenumber: {
        type: String,
        default: '',
    },

    type: {
        type: String,
        default: 'Patient',
    },
});

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;

