const mongoose = require('mongoose');

const {Schema} = mongoose;

const ReviewsSchema = new Schema({
    patient: {
        type: String,
        ref: 'Patient', // Reference to the User model for the patient
        required: true,
      },
      doctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor', // Reference to the Dermatologist model for the dermatologist
        required: true,
      },
      appointment: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment', // Reference to the Appointment model for the patient
        required: true,
      },
      stars: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Reviews', ReviewsSchema)