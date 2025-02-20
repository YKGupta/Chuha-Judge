import User from '../../Models/User/User.js';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

const Signup = async (req, res) => {

    const SECRET_KEY = process.env.SECRET_KEY;
    
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

        const payload = {
            _id: newUser._id,
        };

        const token = jwt.sign(payload, SECRET_KEY);

        return res.json({
            success: true,
            message: "User created successfully",
            token,
            user: {
                name,
                email
            }
        });
    }
    catch(err)
    {
        return res.json({
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
        return res.json({
            success: false,
            message: `Internal Server Error: ${err}`
        });
    }
};

export { Signup, Login }