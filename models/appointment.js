const mongoose = require('mongoose');

const {Schema} = mongoose;


const AppointmentSchema = new Schema({
  patientId: {  
    type: Schema.Types.ObjectId,
    ref: 'Patient', // Reference to the User model for the patient
    required: true,
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor', // Reference to the Dermatologist model for the dermatologist
    required: true,
  },
  date: {
    type: String,
    required: true,
  },

  slot: {
    type: String,
    required: true
  },

  status:{
    type:String,
    default:'pending'
  },

  reviewGiven: {
    type: Boolean,
    default: false,
  },
  // You can add more fields specific to the appointment here, such as reason, status, etc.
});

module.exports = mongoose.model('Appointment', AppointmentSchema);