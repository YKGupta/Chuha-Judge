/*
    TODO: Decide on what to do for different sessions of user
*/

import { compare, hash } from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import SendMail from '../utils/sendMail.js';
import GenerateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

const isDev = process.env.NODE_ENV === "development";

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
                data: null,
                error: {
                    message: "User with this email already exists.",
                    code: "USER_ALREADY_EXISTS"
                }
            });
        }
        
        // Either the user is new, or a user who might want to verify himself
        
        if(!isDev && user && user.lastVerificationEmailSent && user.lastVerificationEmailSent >= Date.now() - process.env.VERIFICATION_WINDOW_TTL * 1000)
        {
            // Wait before sending a new mail
            return res.json({
                success: true,
                data: {
                    message: "Wait before requesting a new verification mail."
                },
                error: null
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
        await SendMail(isDev ? process.env.DEV_EMAIL : email, 
            `Verify your email for Chuha Judge`, 
            `<h2>Click the link below to verify your email</h2>
            <a href="${process.env.HOST}:${process.env.PORT}/api/auth/verify-email?token=${user.verificationToken}">${process.env.HOST}:${process.env.PORT}/api/auth/verify-email?token=${user.verificationToken}</a>
            <p>This link expires in ${Math.floor(process.env.VERIFICATION_TOKEN_TTL / 60)} minute${Math.floor(process.env.VERIFICATION_TOKEN_TTL / 60) > 1 ? 's' : ''}.</p>`
        );

        return res.json({
            success: true,
            data: {
                message: "User registered. Check your email for verification."
            },
            error: null,
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                message: err.message || "Internal Server Error",
                code: "INTERAL_SERVER_ERROR"
            }
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
                data: null,
                error: {
                    message: "Invalid token!",
                    code: "INVALID_TOKEN"
                }
            });

        if(user.tokenExpiresAt < Date.now())
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Token expired!",
                    code: "TOKEN_EXPIRED"
                }
            });

        if(user.isVerified)
            return res.json({
                success: true,
                data: {
                    message: "User is already verified"
                },
                error: null
            });
        
        user.isVerified = true;
        user.tokenExpiresAt = null;
        user.verificationToken= null;
        await user.save();

        return res.json({
            success: true,
            data: {
                message: "Email verified successfully. You can login now."
            },
            error: null
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                message: err.message || "Internal Server Error",
                code: "INTERAL_SERVER_ERROR"
            }
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
                data: null,
                error: {
                    message: "User not found!",
                    code: "USER_NOT_FOUND"
                }
            });

        if(!user.isVerified)
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    message: "Email not verified!",
                    code: "EMAIL_NOT_VERIFIED"
                }
            });

        const isPasswordCorrect = await compare(password, user.password);
        if(!isPasswordCorrect)
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Wrong password!",
                    code: "WRONG_PASSWORD"
                }
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

        user.refreshToken = HashToken(refreshToken);
        await user.save();

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: Number(process.env.ACCESS_TOKEN_TTL) * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: Number(process.env.REFRESH_TOKEN_TTL) * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            data: {
                message: "User logged in successfully!"
            },
            error: null
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                message: err.message || "Internal Server Error",
                code: "INTERAL_SERVER_ERROR"
            }
        });
    }
};

/**
 * Returns the profile of the user specified in the cookie.
 * @param {string} req.user.userID - ID of the user.
 */
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
                data: null,
                error: {
                    message: "User not found!",
                    code: "USER_NOT_FOUND"
                }
            });
        
        return res.json({
            success: true,
            data: {
                message: "User found!",
                user
            },
            error: null
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                message: err.message || "Internal Server Error",
                code: "INTERAL_SERVER_ERROR"
            }
        });
    }
};

/**
 * Handles refreshing the access token of the client based on the refresh token in the cookie.
 * @param {string} req.cookie.refreshToken - Refresh token of the user.
 */
const RefreshHandler = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken)
        return res.status(401).json({
            success: false,
            data: null,
            error: {
                message: "No token provided!",
                code: "MISSING_TOKEN"
            }
        });
    
    try
    {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);
        if(!user || user.refreshToken !== HashToken(refreshToken))
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    message: "Invalid token!",
                    code: "INVALID_TOKEN"
                }
            });

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: `${process.env.ACCESS_TOKEN_TTL}m`}
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: Number(process.env.ACCESS_TOKEN_TTL) * 60 * 1000
        });

        return res.json({
            success: true,
            data: {
                message: "New access token issued successfully!"
            },
            error: null
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                message: err.message || "Internal Server Error",
                code: "INTERAL_SERVER_ERROR"
            }
        });
    }
};

/**
 * Handles logging out users.
 * @param {string} req.cookie.refreshToken - Refresh token of the user.
 */
const LogoutHandler = async (req, res) => {
    try
    {
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken)
            return res.json({
                success: true,
                data: {
                    message: "User logged out successfully!"
                },
                error: null
            });

        await User.updateOne({ refreshToken: HashToken(refreshToken) }, { $unset: { refreshToken: "" } });

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.json({
            success: true,
            data: {
                message: "User logged out successfully!"
            },
            error: null
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                message: err.message || "Internal Server Error",
                code: "INTERAL_SERVER_ERROR"
            }
        });
    }
};

/**
 * Handles redirecting the user to google login screen.
 */
const GoogleRedirectHandler = (req, res) => {

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile')}`;

    return res.redirect(url);
};

/**
 * Handles Google OAuth's callback
 */
const GoogleCallbackHandler = async (req, res) => {

    const { error, code } = req.query;

    if(error)
        return res.status(401).json({
            success: false,
            data: null,
            error: {
                message: "User did not consent to provide the information.",
                code: "MISSING_CONSENT"
            }
        });
    
    try
    {
        const { access_token } = await (await fetch('https://oauth2.googleapis.com/token', {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `code=${code}&client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&grant_type=authorization_code&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}`
        })).json();

        if(!access_token)
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    message: "Exchange Failed!",
                    code: "INTERNAL_SERVER_ERROR"
                }
            });

        const data = await (await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`)).json();

        if(data.error)
            return res.json({
                success: false,
                data: null,
                error: {
                    message: "Invalid token!",
                    code: "INTERNAL_SERVER_ERROR"
                }
            });
        
        const { id, name, email, picture } = data;

        let user = await User.findOne({ email });

        if(!user)
        {
            user = new User({
                username: name,
                email,
                isVerified: true,
                oauthProvider: [{
                    provider: "google",
                    oauthId: id
                }],
                profilePicture: picture
            });

            await user.save();
        }
        else if(!user.oauthProvider.some((val) => val.provider === "google"))
        {
            user.oauthProvider.push({
                provider: "google",
                oauthId: id
            });

            await user.save();
        }

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

        user.refreshToken = HashToken(refreshToken);
        await user.save();

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: Number(process.env.ACCESS_TOKEN_TTL) * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: Number(process.env.REFRESH_TOKEN_TTL) * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            data: {
                message: "User logged in successfully!"
            },
            error: null
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                message: err.message || "Internal Server Error",
                code: "INTERAL_SERVER_ERROR"
            }
        });
    }
};

/**
 * Handles redirecting the user to GitHub login screen.
 */
const GithubRedirectHandler = (req, res) => {

    const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&response_type=code&scope=${encodeURIComponent('user')}`;

    return res.redirect(url);
};

/**
 * Handles GitHub OAuth's callback
 */
const GithubCallbackHandler = async (req, res) => {

    const { error, code } = req.query;

    if(error)
        return res.status(401).json({
            success: false,
            data: null,
            error: {
                message: "User did not consent to provide the information.",
                code: "MISSING_CONSENT"
            }
        });
    
    try
    {
        const { access_token } = await (await fetch('https://github.com/login/oauth/access_token', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                code,
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                redirect_uri: process.env.GITHUB_REDIRECT_URI
            })
        })).json();

        if(!access_token)
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    message: "Exchange Failed!",
                    code: "INTERNAL_SERVER_ERROR"
                }
            });

        const { name, avatar_url , id } = await (await fetch(`https://api.github.com/user`, {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        })).json();

        const [ { email } ] = await (await fetch(`https://api.github.com/user/emails`, {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        })).json();

        let user = await User.findOne({ email });

        if(!user)
        {
            user = new User({
                username: name,
                email,
                isVerified: true,
                oauthProvider: [{
                    provider: "github",
                    oauthId: id
                }],
                profilePicture: avatar_url
            });

            await user.save();
        }
        else if(!user.oauthProvider.some((val) => val.provider === "github"))
        {
            user.oauthProvider.push({
                provider: "github",
                oauthId: id
            });

            await user.save();
        }

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

        user.refreshToken = HashToken(refreshToken);
        await user.save();

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: Number(process.env.ACCESS_TOKEN_TTL) * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: Number(process.env.REFRESH_TOKEN_TTL) * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            data: {
                message: "User logged in successfully!"
            },
            error: null
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                message: err.message || "Internal Server Error",
                code: "INTERAL_SERVER_ERROR"
            }
        });
    }
};

/**
 * Handles generating a hashed version of the input. Uses SHA-256.
 */
const HashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

export { RegisterHandler, VerificationHandler, LoginHandler, ProfileHandler, RefreshHandler, LogoutHandler, GoogleCallbackHandler, GoogleRedirectHandler, GithubRedirectHandler, GithubCallbackHandler };