const mongoose = require('mongoose');

const {Schema} = mongoose;

const PrescriptionSchema = new Schema({
    patient: {
        type: String,
        ref: 'User', // Reference to the User model for the patient
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
      prescription: {
        type: [{
            medicineName: String,
            duration: String,
            dosage: String,
            directions: String
        }],
        required: true
      },
      createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Prescription', PrescriptionSchema)