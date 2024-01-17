const express = require('express');
const doctorauthRouter = express.Router();
const Doctor = require('../models/doctor');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const verifyToken=require('../middlewares/auth')
const Otp=require('../models/otp');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const auth =require('../middlewares/auth')
const Appointment=require('../models/appointment');
const Prescription = require('../models/prescription')
const mongoose = require('mongoose');
const Reviews=require('../models/review');


doctorauthRouter .post('/signin',async (req,res,next) => {
    try {
        console.log("signin")
        const {email,password}=req.body;
       
      

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ msg: "Invalid email format." });
        }
        const existingDoctor=await Doctor.findOne({email});
       //this ! is called guard closers 
        if(!existingDoctor){
            return res.status(400).json({msg: 'Doctor with is email doesnot exist '})
        }
         const isMatch = await bcrypt.compare(password,existingDoctor.password);
         
         if(!isMatch){
           return res.status(400).json({msg : 'Incorrect password'})
        }
       const token = jwt.sign({id:existingDoctor._id},"passwordKey")        
        res.json({token,...existingDoctor._doc});


    } catch (e) {
       return res.status(500).json({ error: e.message });
    }
});

doctorauthRouter.post('/tokenIsValid',async (req,res,next) => {
    try {
       
       const token =req.header('x-auth-token');
        if(!token) return res.json(false);
        const verified=jwt.verify(token , 'passwordKey')
        if(!verified) return res.json(false);

        const doctor=await Doctor.findById(verified.id);
        if(!doctor) return res.json(false); 

        res.json(true);


    } catch (e) {
       return res.status(500).json({ error: e.message });
    }
})

//get user data
doctorauthRouter.get('/',verifyToken , async (req, res) => {
    try {
      // Assuming you have access to 'req.user' for the user's ID
      const doctor = await Doctor.findById(req.user);
      
      // Respond with user data and the token from the request
      res.json({ ...doctor._doc, token: req.token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });


  doctorauthRouter.post('/forget-password',async (req,res)=>{
    const { email } = req.body

    const user = await Doctor.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: 'Invalid email' });
    }

    let token = await Otp.findOne({ userId: user._id })

    if (token) {
        await token.deleteOne()
    }


    // Generate a random 6-digit OTP
    let resetCode = crypto.randomInt(10000, 100000)

    // Save the OTP to the user's document in the database
    const otp = new Otp({ code: resetCode.toString(), userId: user._id })
    await otp.save()

    // Send the OTP to the user's email address
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'Ahmadkamran099@gmail.com',
            pass: 'uqnt yzce mngc rchx'
        }
    }
    )

    const mailOptions = {
        from: 'Ahmadkamran099@gmail.com',
        to: email,
        subject: 'Reset your password',
        text: `Your otp is ${resetCode}. Please enter this code in the reset password form`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error)
            return res.status(500).json({ error: 'Failed to send OTP' })
        }
        res.status(200).json({ id: user._id, email: user.email })
    })
});

doctorauthRouter.post('/otp', async (req, res, next) => {
    const { code, id } = req.body;
  
    try {
      const otp = await Otp.findOne({ userId: id });
  
      if (!otp) {
        return res.status(401).json({ error: "Invalid or expired password reset token" });
      }
  
      const isMatch = await bcrypt.compare(code, otp.code);
  
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid or expired password reset token" });
      }
      
      if (otp.used) {
        return res.status(401).json({ error: "The OTP has already been used" });
      }
  
      res.status(200).json({ message: "OTP is valid, you can reset the password", id: id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  });

  doctorauthRouter.put('/reset-password', async (req, res) => {
    console.log("ahmad");
    const { id, password } = req.body


    const doctor = await Doctor.findOne({ _id: id });
    if (!doctor) {
        return res.status(404).json({ message: 'doctor not found' });
    }
    doctor.password = await bcrypt.hash(password, 10)

    

    await doctor.save();
    return res.status(200).json(doctor)
});



//EDIT PROFILE 
doctorauthRouter.put('/edit-profile', async (req, res) => {
  console.log("ahmad");
  const { id,name, description,phone } = req.body


  const doctor = await Doctor.findOne({ _id: id });
  if (!doctor) {
      return res.status(404).json({ message: 'doctor not found' });
  }

  doctor.name=name,
  doctor.description=description,
  doctor.phone=phone;
  

  await doctor.save();
  return res.status(200).json(doctor)
});









//APPOINTMENT

doctorauthRouter.post('/get-available-hours', async (req, res) => {
  try {
    
    const { email } = req.body;
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const availableHours = doctor.availableOnlineHours;
    res.status(200).json({ availableHours });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

doctorauthRouter.put('/update-availability', async (req, res) => {
  try {
    const { email, availabilityData } = req.body;

    // Find the doctor by their email
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Update the availableOnlineHours
    doctor.availableOnlineHours = availabilityData;
    await doctor.save();

    return res.status(200).json({ message: 'Available online hours updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});




doctorauthRouter.post('/doctors-appointment', async (req, res) => {
  console.log("ahmad");
  const { doctorId  } = req.body;
  
  

  try {
    // Use Mongoose to find all appointments with the specified doctorId
    const appointments = await Appointment.find({ doctorId });

    // Return the list of appointments as a JSON response
    res.json(appointments);
    console.log(1);
  } catch (error) {
    // Handle errors, e.g., return an error response
    res.status(500).json({ error: 'An error occurred while fetching appointments.' });
  }
});










doctorauthRouter.put('/appointment-status',async (req, res) => {

  const { status  , appointmentId} = req.body;

  try {

    // Use Mongoose to find the appointment by ID and update its status
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: status },
      { new: true } // This ensures that the updated appointment is returned
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Return the updated appointment as a JSON response
    res.json(appointment);
  } catch (error) {
    // Handle errors, e.g., return an error response
    res.status(500).json({ error: 'An error occurred while updating the appointment status.' });
  }
});





doctorauthRouter.post('/get-upcomming-appointment',async (req, res) => {
  try {
    console.log("ahmad");
    const {  doctorId} = req.body;
    console.log(req.body)
    // Find all upcoming appointments with populated dermatologist details
    const upcomingAppointments = await Appointment.find({
      status: 'pending',
      doctorId: req.body.doctorId
    })
      .populate({
        path: 'patientId',
        select: 'images  _id name',
      });

      console.log("ali")
      
    res.json(upcomingAppointments);
    console.log(upcomingAppointments)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//add precripitons:-

 // Make sure to import mongoose if not already done

 


 doctorauthRouter.post('/add-prescription', async (req, res) => {
  console.log(req.body)
 
 
  try {
    
    // Create a new Prescription document
    const newPrescription = new Prescription({
      patient: req.body.patient,
      doctor: req.body.doctor,
      appointment: req.body.appointment,
      prescription: req.body.prescription,
    });

    // Save the new prescription to the database
    await newPrescription.save();

    // Update the appointment status to 'completed'
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.body.appointment,
      { status: 'completed' },
      { new: true }
    );
    console.log(updatedAppointment);
    

    res.status(200).json({ message: 'Prescription added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding the prescription' });
  }
});




//COMPLETE 
doctorauthRouter.post('/get-completed-appointment',async (req, res) => {
  try {
    console.log("ahmad");
    const {  doctorId} = req.body;
    console.log(req.body)
    
    const completeAppointments = await Appointment.find({
      status: 'completed',
      doctorId: req.body.doctorId
    })
      .populate({
        path: 'patientId',
        select: 'images  _id name',
      });
      console.log("ahmad12")
      
    res.json(completeAppointments );
    console.log(completeAppointments )
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
doctorauthRouter.get('/get-prescription/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id)
    // Find the prescription using the Appointment ID
    const prescription = await Prescription.findOne({ appointment: id }) 
    console.log(1)
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found for the given appointment ID' });
    }
    console.log(2)
    // Return the prescription as a JSON response
    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

doctorauthRouter.get('/get-reviews-appointment/:id',async (req, res) => {
  try{
    
    
  const reviews = await Reviews.findOne({ appointment: req.params.id});
  res.json(reviews);
  console.log(reviews);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});














doctorauthRouter.get('/all-review/:id',async (req, res) => {
  try {
    
      console.log(1)
    // Use Mongoose to find all reviews for the given doctor ID
    const reviews = await Reviews.find({ doctor: req.params.id }).exec();

    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});








doctorauthRouter.get('/:doctorId/average-rating', async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    // Fetch all reviews for the specified doctor
    const reviews = await Reviews.find({ doctor: doctorId });

    // Calculate the average star rating
    const totalStars = reviews.reduce((sum, review) => sum + parseInt(review.stars), 0);
    const averageRating = Math.round(totalStars / reviews.length);

    // Update the Doctor model with the calculated average rating
    await Doctor.findByIdAndUpdate(doctorId, { $set: { star: averageRating } });

    res.json({ averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  



module.exports = doctorauthRouter;