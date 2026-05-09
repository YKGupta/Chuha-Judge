import jwt from 'jsonwebtoken';

const AuthMiddleware = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;

    if(!accessToken)
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                message: "No token provided!",
                code: "MISSING_TOKEN"
            }
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
            data: null,
            error: {
                message: err.messaage || "Internal Server Error",
                code: "INTERAL_SERVER_ERROR"
            }
        });
    }
};

export default AuthMiddleware;