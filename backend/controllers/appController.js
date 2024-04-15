import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import ENV from '../config.js';
import UserModel from '../model/User.model.js';




export async function login(req, res) {
    const { email, password } = req.body;

    try {
      
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

      
        const passwordCheck = await bcrypt.compare(password, user.password);

        if (!passwordCheck) {
            return res.status(400).send({ error: "Password does not match" });
        }

        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            role: user.role
        }, ENV.JWT_SECRET, { expiresIn: "24h" });

        return res.status(200).send({
            msg: "Login Successful",
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        return res.status(500).send({ error: "Internal Server Error" });
    }
}



export async function updateUser(req, res) {
    try {
        const { userId } = req.user;

        if (userId) {
            const body = req.body;

            
            UserModel.findByIdAndUpdate(userId, body, { new: true }, function (err, user) {
                if (err) throw err;

                return res.status(200).send(user);
            });
        } else {
            return res.status(401).send({ error: "User Not Found...!" });
        }

    } catch (error) {
        return res.status(401).send({ error });
    }
}
export async function getUser(req, res) {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).send({ error: 'Please provide the email' });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        return res.status(200).send(user);
    } catch (error) {
        console.error('Error retrieving user:', error);
        return res.status(500).send({ error: 'Internal server error' });
    }
}
export async function signup(req, res) {
    const { role, name, email, password, phone, address, cin } = req.body;

    try {
       
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(400).send({ error: 'User already exists with this email.' });
        }

        let newUser;
        switch (role) {
            case 'job_seeker':
                newUser = new UserModel({
                    name,
                    email,
                    phone,
                    password: await bcrypt.hash(password, 10),
                    role,
                });
                break;
            case 'company':
                newUser = new UserModel({
                    name,
                    email,
                    password: await bcrypt.hash(password, 10),
                    address,
                    role,
                    cin
                });
                break;
            default:
                return res.status(400).send({ error: "Invalid role specified." });
        }

       
        req.app.locals.tempUser = newUser;

        const otp = await createOTP(req);

        await sendOTPEmail(name, email, otp);

        return res.status(201).send({ message: "Please verify your email with OTP." });
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).send({ error: "An error occurred during signup." });
    }
}

export async function validateOTPAndRegister(req, res) {
    try {
        const { enteredOTP } = req.body;
       
        const storedOTP = req.app.locals.OTP;

        if (!(storedOTP && enteredOTP === storedOTP)) {
            return res.status(400).send({ error: 'Invalid OTP. Registration failed.' });
        }

        const newUser = req.app.locals.tempUser;

        if (!newUser) {
            return res.status(400).send({ error: 'No user found. Registration failed.' });
        }

        try {
           
            const existingUser = await UserModel.findOne({ email: newUser.email });

            if (existingUser) {
                return res.status(400).send({ error: 'User already exists' });
            }

           
            await newUser.save();

          
            req.app.locals.OTP = null;
            req.app.locals.tempUser = null;

            return res.status(201).send({ msg: 'User Registered Successfully' });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).send({ error: 'Error creating user' });
        }
    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).send({ error: 'Internal server error' });
    }
}


export async function createOTP(req) {
    try {
        if (req && req.app && req.app.locals) {
            const OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
            req.app.locals.OTP = OTP; 
            return OTP; 
        } else {
            throw new Error('Invalid request object.');
        }
    } catch (error) {
        console.error('Error generating OTP:', error);
        throw new Error('Failed to generate OTP.');
    }
}

export async function sendOTPEmail(name, email, otp) {
    try {
   
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'shreetammishra01@gmail.com',
                pass: 'rsfghymlzapvfbyh'
            }
        });

       
        let mailOptions = {
            from: 'shreetammishra01@gmail.com',
            to: email,
            subject: 'Verification OTP for Registration',
            text: `Hello ${name}, Your OTP is: ${otp}`
        };

       
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email.');
    }
}