import { hash } from 'bcrypt';
import nodemailer from 'nodemailer';
import User from '../../models/User';

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
        
        if(user && user.lastVerificationEmailSent && user.lastVerificationEmailSent >= Date.now() - process.env.VERIFICATION_WINDOW_TIME_LIMIT)
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
                verificationToken: GenerateVerificationToken(),
                tokenExpiresAt: new Date(Date.now() + process.env.VERIFICATION_TOKEN_TTL * 1000)
            });
        }
        // It might happen that the user has created an account but the verification token has expired
        else if(user.tokenExpiresAt < Date.now())
        {
            // Only token has expired, so we will generate a new token
            const token = GenerateVerificationToken();
            user.verificationToken = token;
            user.tokenExpiresAt = new Date(Date.now() + process.env.VERIFICATION_TOKEN_TTL * 1000);
        }

        user.lastVerificationEmailSent = Date.now();
        await user.save();

        // Send a verification mail
        SendMail(email, 
            `Verify your email for Chuha Judge`, 
            `<h2>Click the link below to verify your email<h2>
            <a href="LINK">LINK</a>
            <p>This link expires in 1 hour</p>`
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

const GenerateVerificationToken = () => {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return hashedToken;
};

const SendMail = async (email, mailSubject, mailMessage) => {

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
        subject: mailSubject,
        html: mailMessage
    };

    await transporter.sendMail(mailOptions);
};

export { RegisterHandler };