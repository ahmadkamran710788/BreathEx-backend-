const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const {Schema} = mongoose;

const OtpSchema = new Schema({

    code: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },

    expireAt: {
        type: Date,
        default: Date.now(),
        expires: 7200
    }
    
}, {timestamps: true})

OtpSchema.pre('save', function (next) {
    let otp = this;
    const saltRounds = 10;

    if (!otp.isModified('code')) {
        return (next)
    }

    bcrypt.genSalt(saltRounds, (err, salt) => {

        if(err){
            return next(err)
        }

        bcrypt.hash(otp.code, salt, (err, hash) => {
            if(err){
                return next(err)
            }

            otp.code = hash
            next()
        })
    })
})


// OtpSchema.methods.compareCode = async function(candidateCode) {
//     try{
//         const isMatch = await bcrypt.compare(candidateCode, this.code)
//         return isMatch
//     }
//     catch (error) {
//         throw error
//     }
// }

module.exports = mongoose.model('Otp', OtpSchema)