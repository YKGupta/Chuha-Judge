/**
 * TODO
 * 
 * Hash the refresh tokens
 * 
 */


import { compare, hash } from 'bcrypt';
import User from '../../models/User/index.js';
import SendMail from '../../utils/SendMail/index.js';
import GenerateToken from '../../utils/GenerateToken/index.js';
import jwt from 'jsonwebtoken';

/**
 * Handles signing up new users. The params mentioned are request body.
 * @param {string} username - Name of the user.
 * @param {string} email - Email of the user.
 * @param {string} password - Password of the user.
 */
const RegisterHandler = async (req, res) => {

    const { username, email, password } = req.body;

    try
    {
        let user = await User.findOne({ email });
        if(user && user.isVerified)
        {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists."
            });
        }
        
        // Either the user is new, or a user who might want to verify himself
        
        if(user && user.lastVerificationEmailSent && user.lastVerificationEmailSent >= Date.now() - process.env.VERIFICATION_WINDOW_TTL * 1000)
        {
            // Wait before sending a new mail
            return res.json({
                success: true,
                message: "Wait before requesting a new verification mail."
            });
        }

        if(!user)
        {
            // Create a new user
            const hashedPassword = await hash(password, 10);
            user = new User({
                username,
                email,
                password: hashedPassword,
                verificationToken: GenerateToken(),
                tokenExpiresAt: new Date(Date.now() + process.env.VERIFICATION_TOKEN_TTL * 1000)
            });
        }
        // It might happen that the user has created an account but the verification token has expired
        else if(user.tokenExpiresAt < Date.now())
        {
            // Only token has expired, so we will generate a new token
            const token = GenerateToken();
            user.verificationToken = token;
            user.tokenExpiresAt = new Date(Date.now() + process.env.VERIFICATION_TOKEN_TTL * 1000);
        }

        user.lastVerificationEmailSent = Date.now();
        await user.save();

        // Send a verification mail
        SendMail(email, 
            `Verify your email for Chuha Judge`, 
            `<h2>Click the link below to verify your email</h2>
            <a href="${process.env.HOST}:${process.env.PORT}/api/auth/verify-email?token=${user.verificationToken}">${process.env.HOST}:${process.env.PORT}/api/auth/verify-email?token=${user.verificationToken}</a>
            <p>This link expires in ${Math.floor(process.env.VERIFICATION_TOKEN_TTL / 60)} minute${Math.floor(process.env.VERIFICATION_TOKEN_TTL / 60) > 1 ? 's' : ''}.</p>`
        );

        return res.json({
            success: true,
            message: "User registered. Check your email for verification."
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            message: JSON.stringify(err)
        });
    }
};


/**
 * Handles verifying emails for users. The params mentioned are query params.
 * @param {string} token - Verification token provided to the user.
 */
const VerificationHandler = async (req, res) => {

    const { token } = req.query;

    try
    {
        const user = await User.findOne({ verificationToken: token });

        if(!user)
            return res.status(400).json({
                success: false,
                message: "Invalid token!"
            });

        if(user.tokenExpiresAt < Date.now())
            return res.status(400).json({
                success: false,
                message: "Token expired!"
            });

        if(user.isVerified)
            return res.status(400).json({
                success: false,
                message: "User is already verified!"
            });
        
        user.isVerified = true;
        user.tokenExpiresAt = null;
        user.verificationToken= null;
        await user.save();

        return res.json({
            success: true,
            message: "Email verified successfully. You can login now."
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            message: JSON.stringify(err)
        });
    }
};

/**
 * Handles logging up new users. The params mentioned are request body.
 * @param {string} email - Email of the user.
 * @param {string} password - Password of the user.
 */
const LoginHandler = async (req, res) => {

    const { email, password } = req.body;

    try
    {
        const user = await User.findOne({ email });
        if(!user)
            return res.status(400).json({
                success: false,
                message: "User not found!"
            });

        const isPasswordCorrect = await compare(password, user.password);
        if(!isPasswordCorrect)
            return res.status(400).json({
                success: false,
                message: "Wrong password!"
            });
        
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: `${process.env.ACCESS_TOKEN_TTL}m`}
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: `${process.env.REFRESH_TOKEN_TTL}d`}
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: Number(process.env.ACCESS_TOKEN_TTL) * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: Number(process.env.REFRESH_TOKEN_TTL) * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            message: "User logged in successfully!",
            accessToken
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            message: JSON.stringify(err)
        });
    }
};

const ProfileHandler = async (req, res) => {

    const projection = {
        username: 1,
        email: 1,
        profilePicture: 1,
        rating: 1,
        problemsSolved: 1,
        submissionHistory: 1,
        createdAt: 1
    };

    try
    {
        const user = await User.findById(req.user.userId, projection);
        if(!user)
            return res.status(400).json({
                success: false,
                message: "User not found!"
            });
        
        return res.json({
            success: true,
            message: "User found!",
            user
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            message: JSON.stringify(err)
        });
    }
};

const RefreshHandler = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken)
        return res.status(400).json({
            success: false,
            message: "No token provided!"
        });
    
    try
    {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);
        if(!user || user.refreshToken !== refreshToken)
            return res.status(400).json({
                success: false,
                message: "Invalid token!"
            });

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: `${process.env.ACCESS_TOKEN_TTL}m`}
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: Number(process.env.ACCESS_TOKEN_TTL) * 60 * 1000
        });

        return res.json({
            success: true,
            message: "New access token issued successfully!",
            accessToken
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            message: JSON.stringify(err)
        });
    }
};

const LogoutHandler = async (req, res) => {
    try
    {
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken)
            return res.json({
                success: true,
                message: "User logged out successfully!"
            });

        await User.updateOne({ refreshToken }, { $unset: { refreshToken: "" } });

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.json({
            success: true,
            message: "User logged out successfully!"
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            message: JSON.stringify(err)
        });
    }
};

export { RegisterHandler, VerificationHandler, LoginHandler, ProfileHandler, RefreshHandler, LogoutHandler };