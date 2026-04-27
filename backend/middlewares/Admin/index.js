import User from "../../models/User";

const AdminMiddleware = async (req, res, next) => {
    try
    {
        const user = await User.findById(req.user.userId).lean();

        if(!user)
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    message: "User not found",
                    code: "USER_NOT_FOUND"
                }
            });

        if(user.email !== process.env.ADMIN_EMAIL)
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    message: "Forbidden",
                    code: "FORBIDDEN"
                }
            })

        next();
    }
    catch(err)
    {
        return res.status(500).json({
            success: false,
            data: null,
            error: {
                message: err.message || "Internal Server Error",
                code: "INTERNAL_SERVER_ERROR"
            }
        });
    }
};

export default AdminMiddleware;