import { hash } from 'bcrypt';
import User from '../../models/User/index.js';
import SendMail from '../../utils/SendMail/index.js';
import GenerateToken from '../../utils/GenerateToken/index.js';

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

export { RegisterHandler, VerificationHandler };