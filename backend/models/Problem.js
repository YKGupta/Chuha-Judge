import { model, Schema } from "mongoose";

const ProblemSchema = Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        limits: {
            time: {
                type: Number,
                required: true,
                min: 1,
            },
            memory: {
                type: Number,
                required: true,
                min: 1,
            },
        },
        constraints: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Problem = model("Problem", ProblemSchema, "Problems");

export default Problem;
