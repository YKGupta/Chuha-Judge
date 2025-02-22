import User from '../../Models/User/User.js';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const Signup = async (req, res) => {
    
    try
    {
        const { name, email, password } = req.body;
        const oldUser = await User.findOne({ email });
        if(oldUser)
            return res.json({
                success: false,
                message: "User with this email id already exists!"
            });

        const hashedPassword = await hash(password, 10);

        const newUser = new User({
            name,
            email,
            hashedPassword
        });

        await newUser.save();

        await SendVerificationEmail(email, newUser._id);

        return res.json({
            success: true,
            message: "User created successfully, verify email",
            user: {
                name,
                email
            }
        });
    }
    catch(err)
    {
        return res.status(500).json({
            success: false,
            message: `Internal Server Error: ${err}`
        });
    }
};

const Verify = async (req, res) => {

    const SECRET_KEY = process.env.SECRET_KEY;

    try
    {
        const token = req.params.token;
        const payload = jwt.verify(token, SECRET_KEY);
        
        const user = await User.findById(payload._id);
        if(!user)
            return res.json({
                success: false,
                message: "Invalid Token"
            });

        if(user.isVerified)
            return res.json({
                success: false,
                message: "User already verified"
            });
        
        user.isVerified = true;
        await user.save();

        res.json({
            success: true,
            message: "User verified successfully"
        });
    }
    catch(err)
    {
        return res.status(500).json({
            success: false,
            message: `Internal Server Error: ${err}`
        });
    }
};

const Login = async (req, res) => {

    const SECRET_KEY = process.env.SECRET_KEY;
    
    try
    {
        const { email, password } = req.body;
        const oldUser = await User.findOne({ email });
        if(!oldUser)
            return res.json({
                success: false,
                message: "User not found!"
            });
        
        if(!oldUser.isVerified)
            return res.json({
                success: false,
                message: "Email not verified!"
            });

        const isPasswordCorrect = compare(password, oldUser.hashedPassword);
        if(!isPasswordCorrect)
            return res.json({
                success: false,
                message: "Wrong password!"
            });
        
        const payload = {
            _id: oldUser._id,
        };

        const token = jwt.sign(payload, SECRET_KEY);

        return res.json({
            success: true,
            message: "User logged in successfully",
            token,
            user: {
                name: oldUser.name,
                email
            }
        });
    }
    catch(err)
    {
        return res.status(500).json({
            success: false,
            message: `Internal Server Error: ${err}`
        });
    }
};

const Get = async (req, res) => {    
    try
    {
        const user = await User.findById(req._id);
        if(!user)
            return res.json({
                success: false,
                message: "User not found!"
            });
        
        if(!user.isVerified)
            return res.json({
                success: false,
                message: "Email not verified!"
            });

        return res.json({
            success: true,
            message: "User details fetched successfully",
            user: {
                name: user.name,
                email: user.email
            }
        });
    }
    catch(err)
    {
        return res.status(500).json({
            success: false,
            message: `Internal Server Error: ${err}`
        });
    }
};

const SendVerificationEmail = async (email, _id) => {

    const SECRET_KEY = process.env.SECRET_KEY;
    const HOST = process.env.HOST;
    const PORT = process.env.PORT;

    const payload = {
        _id
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    const verificationLink = `${HOST}:${PORT}/users/verify/${token}`;

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: email,
        subject: "Verify your email for Chuha Judge",
        html: `<h2>Click the link below to verify your email<h2>
               <a href="${verificationLink}">${verificationLink}</a>
               <p>This link expires in 1 hour</p>`
    };

    await transporter.sendMail(mailOptions);
};

export { Signup, Login, Get, Verify }