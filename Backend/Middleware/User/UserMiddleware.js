import { verify } from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

const ValidateToken = async (req, res, next) => {
    try
    {
        const token = req.header("token");
        const payload = verify(token, SECRET_KEY);
        req._id = payload._id;
        next();
    }
    catch(err)
    {
        return res.json({
            success: false,
            message: `Internal Server Error: ${err}`
        });
    }
};

export default ValidateToken;