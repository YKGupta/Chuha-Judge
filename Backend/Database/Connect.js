import { connect } from "mongoose";

const Connect = () => {
    const URI = process.env.DB_URI;

    connect(URI).then(() => {
        console.log("Database connected successfully");
    }).catch((err) => {
        console.log(`Database connection failed: ${err}`)
    });
};

export default Connect;