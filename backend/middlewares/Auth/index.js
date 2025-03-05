import jwt from 'jsonwebtoken';

const AuthMiddleware = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;

    if(!accessToken)
        return res.status(400).json({
            success: false,
            message: "No token provided!"
        });
    
    try
    {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            message: JSON.stringify(err)
        });
    }
};

export default AuthMiddleware;