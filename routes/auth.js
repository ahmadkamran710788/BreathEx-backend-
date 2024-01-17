const express = require('express');
const authRouter = express.Router();
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const Appointment=require('../models/appointment');
const Prescription=require('../models/prescription');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const verifyToken=require('../middlewares/auth')
const Otp=require('../models/otp');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Review=require('../models/review')
const Stripe=require('stripe');





authRouter.post('/api/signup', async (req, res) => {
    try {
        console.log("signup")
        const { name, email, password, phonenumber } = req.body;
        
       

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ msg: "Invalid email format." });
        }

        // Check if the user with the given email already exists
        const existingPatient = await Patient.findOne({ email });

        if (existingPatient) {
            return res.status(400).json({ msg: "User with this email already exists." });
        } 
 
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Create a new user
        let newPatient = new Patient({
            name,
            email,
            password: hashedPassword,
            phonenumber,  // Store the hashed password in the "password" field
        });

        // Save the user to the database
        const savedPatient = await newPatient.save();

        // Respond with the saved user object
        res.json(savedPatient);

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
//sign in route
authRouter.post('/api/signin',async (req,res,next) => {
    try {
        console.log("signin")
        const {email,password}=req.body;
       
      

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ msg: "Invalid email format." });
        }
        const existingPatient=await Patient.findOne({email});
       //this ! is called guard closers 
        if(!existingPatient){
            return res.status(400).json({msg: 'Patient with is email doesnot exist '})
        }
         const isMatch = await bcrypt.compare(password,existingPatient.password);
         
         if(!isMatch){
           return res.status(400).json({msg : 'Incorrect password'})
        }
       const token = jwt.sign({id:existingPatient._id},"passwordKey")        
        res.json({token,...existingPatient._doc});


    } catch (e) {
       return res.status(500).json({ error: e.message });
    }
});

authRouter.post('/tokenIsValid',async (req,res,next) => {
    try {
       
       const token =req.header('x-auth-token');
        if(!token) return res.json(false);
        const verified=jwt.verify(token , 'passwordKey')
        if(!verified) return res.json(false);

        const patient=await Patient.findById(verified.id);
        if(!patient) return res.json(false); 

        res.json(true);


    } catch (e) {
       return res.status(500).json({ error: e.message });
    }
})

//get user data
authRouter.get('/',verifyToken , async (req, res) => {
    try {
      // Assuming you have access to 'req.user' for the user's ID
      const patient = await Patient.findById(req.user);
      
      // Respond with user data and the token from the request
      res.json({ ...patient._doc, token: req.token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });


  
authRouter.post('/forget-password',async (req,res)=>{
    const { email } = req.body

    const user = await Patient.findOne({ email });

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
authRouter.post('/otp', async (req, res, next) => {
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

  authRouter.put('/reset-password', async (req, res) => {
    const { id, password } = req.body


    const patient = await Patient.findOne({ _id: id });
    if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
    }
    
    patient.password = await bcrypt.hash(password, 10)
    await patient.save();
    return res.status(200).json(admin)
});



authRouter.put('/edit-profile', async (req, res) => {
  console.log("ahmad");
  const { id,name,phone } = req.body


  const patient = await Patient.findOne({ _id: id });
  if (!patient) {
      return res.status(404).json({ message: 'patient not found' });
  }
    
  patient.name=name,
  patient.phone=phone;
  

  await patient.save();
  return res.status(200).json(patient)
});



//list of doctors recently added


authRouter.get('/get-doctors',async(req,res)=>{
    console.log("GET doctor")
    try {
        
            
    const doctors=await Doctor.find({});
    
    res.json(doctors);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
    
    
    
    }); 



    authRouter.post('/get-available-slots', async (req, res) => {
        try {
            console.log("ahmad");
          const { date, doctorId} = req.body;
          
          const newDate = date.slice(0, 10);
      
          // Find the dermatologist based on the provided ID
          const doctor = await Doctor.findById(doctorId);
      
          if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found for the provided ID' });
          }
      
          // Create a Date object from the provided date string
          const parsedDate = new Date(date);
      
          // Get the day of the week (0 = Sunday, 1 = Monday, ...)
          const dayOfWeek = parsedDate.getDay();
          const dayOfWeekStr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      
          // Assuming `dermatologist` is a property of the `doctor` object with online hours
          const onlineHours = doctor.availableOnlineHours[dayOfWeekStr] || [];
      
          // Query the appointments for the dermatologist on the given day of the week
          const appointments = await Appointment.find({
            doctor: doctorId,
            date: newDate,
          });
      
          // Extract the booked slots from the appointments
          const bookedSlots = appointments.map((appointment) => appointment.slot);
      
          if (onlineHours.length === 0) {
            return res.status(200).json({ availableSlots: [] });
          }
      
          // Determine available slots by removing booked slots from online hours
          const availableSlots = onlineHours.filter((slot) => !bookedSlots.includes(slot));
      
          return res.status(200).json({ availableSlots });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });

      //ok
      authRouter.get('/strip-payment/:id/:userid',async(req,res)=>{
    try{
          console.log("payment");
        const stripe = new Stripe("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", {
          apiVersion: '2022-11-15',
          typescript: true,
        });
    const paymentIntent = await stripe.paymentIntents.create({
          amount: 150,
          currency: 'usd',
          metadata: {
            userId: req.params.userid,
            appointment_id: req.params.id,
            
          },
          automatic_payment_methods: {
            enabled: false,
          },
        });
        const data = {
          paymentIntent: paymentIntent.client_secret,
        };
        
        res.send( {
          status: 1,
          data,
        })
      }catch(error){
        console.log(error)
      }

      }); 
      authRouter.post('/book-appointment', async (req, res) => {
        console.log('Ahmad')
        try {
          const {doctorId, date, slot,patientId } = req.body;
          console.log(req.body)
      
          // Check if the appointment slot is available
          const existingAppointment = await Appointment.findOne({
            doctorId: req.body.doctorId,
            date: req.body.date.trim(),
            slot: req.body.slot.trim(),
          });
      
      
          if (existingAppointment) {
            return res.status(400).json({ error: 'Slot already booked' });
          }

          // Create a new appointment
          const newAppointment = new Appointment({
            patientId: req.body.patientId,
            doctorId: req.body.doctorId,
            date: req.body.date.trim(),
            slot: req.body.slot.trim(),
          });
          console.log(3)
      
          // Save the appointment to the database
          await newAppointment.save();

          console.log(4)

      
          return res.status(200).json({ message: 'Appointment booked successfully' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
      
      

      authRouter.get("/api/doctor/search/:name", verifyToken, async (req, res) => {
        try {
          const doctors = await Doctor.find({
            name: { $regex: req.params.name, $options: "i" },
          });
          res.json(doctors);
        } catch (e) {
          console.error("Error:", e);
          res.status(500).json({ error: e.message });
        }
      });

      // authRouter.post('/detect', async (req, res) => {

      // })







      authRouter.post('/upcoming-appointment', async (req, res) => {
        try {
          const{ patientId }=req.body
          console.log(patientId);
          // Find all upcoming appointments with populated dermatologist details
          const upcomingAppointments = await Appointment.find({
            status: 'pending',
            patientId: req.body.patientId
          })
            .populate({
              path: 'doctorId',
               select: 'images  _id name',
            });
            console.log(upcomingAppointments );  
          res.json(upcomingAppointments);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

//check complete
authRouter.post('/completed-appointment', async (req, res) => {
  try {
    const{ patientId }=req.body
    console.log(patientId);
    // Find all upcoming appointments with populated dermatologist details
    const upcomingAppointments = await Appointment.find({
      status: 'completed',
      patientId: req.body.patientId
    })
      .populate({
        path: 'doctorId',
         select: 'images  _id name',
      });
      console.log(upcomingAppointments );  
    res.json(upcomingAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//check done 
      authRouter.get('/get-prescription/:id',async (req, res) => {
        try {
          const id = req.params.id;
          console.log(id)
          // Find the prescription using the Appointment ID
          const prescription = await Prescription.findOne({ appointment: id})
          if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found for the given appointment ID' });
          }
          // Return the prescription as a JSON response
          res.json(prescription);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error' });
        }
      });





      authRouter.post('/add-comment',async (req, res) => {
        const { patient, doctor, appointment, stars, content } = req.body;
        try {
          console.log(req.body);
          // Create a new review
          const review = new Review({
            patient,
            doctor,
            appointment,
            stars,
            content,
          });
      
          // Save the review
          await review.save();
          console.log("1");
      
          // Update the appointment's reviewGiven field to true
          await Appointment.findOneAndUpdate(
            { _id: appointment },
            { $set: { reviewGiven: true } }
          );
          console.log("2");
      
          res.status(200).json({ message: 'Review posted successfully' });
          console.log(1)
        } catch (error) {
          res.status(500).json({ error: 'An error occurred while posting the review' });
        }
      });


      authRouter.get('/get-all-reviews/:id',async (req, res) => {
        try {
          
         /// Assuming you receive the dermatologist's ID as a route parameter
          // Find all reviews for the specific dermatologist
          const reviews = await Review.find({ doctor: req.params.id});
          console.log(reviews)
          res.json(reviews);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });






      
      
      module.exports = authRouter;
      