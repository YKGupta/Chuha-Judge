import mongoose from "mongoose";

export default async function connectDB() {
    try {
        await mongoose.connect(process.env.DB_URI);

        console.log(`Connected to Database(${process.env.DB_URI})`);
    } catch (err) {
        console.log(
            `Encountered error while connecting to database: ${JSON.stringify(err.message)}`
        );
        process.exit(1);
    }
}
