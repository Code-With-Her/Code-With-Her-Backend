
import mongoose from 'mongoose';

const TempUserSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    phone:String,
    bio: String,
    password: String,
    verificationToken: String,
    profileImage: {type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    otp: String,
    otpExpires: Date
});

const TempUserModel = mongoose.model('TempUser', TempUserSchema);

export default TempUserModel; // Ensure this is a default export
