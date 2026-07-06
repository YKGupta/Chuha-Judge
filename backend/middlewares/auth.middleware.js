import jwt from "jsonwebtoken";

const AuthMiddleware = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken)
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                message: "No token provided!",
                code: "MISSING_TOKEN",
            },
        });

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                error: {
                    code: "TOKEN_EXPIRED",
                    message: "Access token expired",
                },
            });
        }

        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                error: {
                    code: "INVALID_TOKEN",
                    message: "Invalid token",
                },
            });
        }

        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
            },
        });
    }
};

export default AuthMiddleware;
