const express = require('express');
const adminauthRouter = express.Router();
const Admin = require('../models/admin');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const verifyToken=require('../middlewares/auth');
const Doctor = require('../models/doctor');
const admin=require('../middlewares/admin');
const Otp=require('../models/otp');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Patient = require('../models/patient');


adminauthRouter.post('/signup', async (req, res) => {
    try {
        console.log("signup")
        const { name, email, password} = req.body;
        
       

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ msg: "Invalid email format." });
        }

        
        const existingAdmin= await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({ msg: "Admin with this email already exists." });
        } 
 
        
        const hashedPassword = await bcrypt.hash(password, 8);

        
        let newAdmin= new Admin({
            name,
            email,
            password: hashedPassword,
            
        });

        
        const savedAdmin = await newAdmin.save();

        
        res.json(savedAdmin);

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
//sign in route
adminauthRouter.post('/signin',async (req,res,next) => {
    try {
        console.log("signin")
        const {email,password}=req.body;
       
      

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ msg: "Invalid email format." });
        }
        const existingAdmin=await Admin.findOne({email});
      
        if(!existingAdmin){
            return res.status(400).json({msg: 'Admin with is email doesnot exist '})
        }
         const isMatch = await bcrypt.compare(password,existingAdmin.password);
         
         if(!isMatch){
           return res.status(400).json({msg : 'Incorrect password'})
        }
       const token = jwt.sign({id:existingAdmin._id},"passwordKey")        
        res.json({token,...existingAdmin._doc});


    } catch (e) {
       return res.status(500).json({ error: e.message });
    }
});

adminauthRouter.post('/tokenIsValid',async (req,res,next) => {
    try {
       
       const token =req.header('x-auth-token');
        if(!token) return res.json(false);
        const verified=jwt.verify(token , 'passwordKey')
        if(!verified) return res.json(false);

        const admin=await Admin.findById(verified.id);
        if(!Admin) return res.json(false); 

        res.json(true);


    } catch (e) {
       return res.status(500).json({ error: e.message });
    }
})

//get user data
adminauthRouter.get('/',verifyToken , async (req, res) => {
    try {
 
      const admin= await Admin.findById(req.user);
 
      res.json({ ...admin._doc, token: req.token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });



//ADD DOCTOR
adminauthRouter.post('/add-doctor',admin,async(req,res)=>{
try {
    const {email,password,name,description,images,phone,specialization,medicalliecensenumber,gender}=req.body;
        console.log("add doctor")

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ msg: "Invalid email format." });
        }

      
        const existingDoctor = await Doctor.findOne({ email });

        if (existingDoctor) {
            return res.status(400).json({ msg: "User with this email already exists." });
        } 
 
        const hashedPassword = await bcrypt.hash(password, 8);

let doctor=new Doctor({
    email,
    password:hashedPassword,
    name,
    description,
    images,
    phone,
    specialization,
    medicalliecensenumber,
    gender
});
doctor =await doctor.save();
res.json(doctor);
} catch (e) {
    res.status(500).json({error: e.message});
}


});




//delete a doctor
adminauthRouter.post('/delete-doctor',admin,async(req,res)=>{
try {
    const {id}=req.body;
    let doctor=await Doctor.findByIdAndDelete(id);

    res.json(doctor);
} catch (e) {
    res.status(500).json({error: e.message});
}
});


adminauthRouter.get('/get-doctors',admin,async(req,res)=>{
console.log("GET doctor")
try {
    
        
const doctors=await Doctor.find({});

res.json(doctors);
} catch (e) {
    res.status(500).json({error: e.message});
}





}); 


//delete a doctor
adminauthRouter.post('/delete-patient',admin,async(req,res)=>{
    try {
        const {id}=req.body;
        let patient=await Patient.findByIdAndDelete(id);
    
        res.json(patient);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
    });
    



adminauthRouter.get('/get-patients',admin,async(req,res)=>{
    console.log("GET patient")
    try {
        
            
    const patient=await Patient.find({});
    console.log(2);
    res.json(patient);
    console.log(3);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
    }); 
    







adminauthRouter.post('/forget-password',async (req,res)=>{
    const { email } = req.body

    const user = await Admin.findOne({ email });

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
adminauthRouter.post('/otp', async (req, res, next) => {
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

  adminauthRouter.put('/reset-password', async (req, res) => {
    const { id, password } = req.body
    
    const admin = await Admin.findOne({ _id: id });
    if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
    }

    

    admin.password = await bcrypt.hash(password, 10)

    await admin.save();
    return res.status(200).json(admin)
});










module.exports = adminauthRouter;