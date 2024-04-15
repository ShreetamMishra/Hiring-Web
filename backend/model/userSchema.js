import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your Name!"],
 
  },
  email: {
    type: String,
    required: [true, "Please enter your Email!"]
  },
  phone: {
    type: Number,
    required: [false, "Please enter your Phone Number!"],
  },
  password: {
    type: String,
    required: true
},
  role: {
    type: String,
    required: [true, "Please select a role"],
  },
 
});




export const User = mongoose.model("User", userSchema);
