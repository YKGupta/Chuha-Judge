import User from "../../Models/User/User.js";

const UserAdmin = async (req, res, next) => {
    try
    {
        const user = await User.findById(req._id);
        if(!user || !user.isAdmin)
            return res.status(400).json({
                success: false,
                message: "You are not authorized to do this operation"
            });
        next();
    }
    catch(err)
    {
        return res.status(500).json({
            success: false,
            message: `Internal Server Error: ${err}`
        });
    }
};

export default UserAdmin;