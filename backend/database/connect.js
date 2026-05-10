import mongoose from "mongoose";

mongoose
    .connect(process.env.DB_URI)
    .then(() => {
        console.log(`Connected to Database(${process.env.DB_URI})`);
    })
    .catch((err) => {
        console.log(
            `Encountered error while connecting to database: ${JSON.stringify(err)}`
        );
    });
