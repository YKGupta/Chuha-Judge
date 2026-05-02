const ApiKeyAuthMiddleware = (req, res, next) => {
    try
    {
        const apiKey = req.headers["x-api-key"];
        if(!apiKey)
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    message: "API Key missing",
                    code: "API_KEY_MISSING"
                }
            });

        if(!apiKey === process.env.API_KEY)
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    message: "Invalid API Key",
                    code: "INVALID_API_KEY"
                }
            });

        next();
    }
    catch(e)
    {
        return res.status(500).json({
            success: false,
            data: null,
            error: {
                message: e.message || "Internal Server Error",
                code: "INTERNAL_SERVER_ERROR"
            }
        });
    }
};

export default ApiKeyAuthMiddleware;