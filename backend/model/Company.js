import mongoose from 'mongoose';


const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: [true, "Please select a role"],
      },
    address: {
        type: String,
        required: false
    },
    cin: {
        type: Number,
        required: false
    },
    
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);

export default Company;
