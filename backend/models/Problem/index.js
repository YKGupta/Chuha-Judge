import { model, Schema } from "mongoose";

const ProblemSchema = Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    difficulty: {
        type: String,
        enum: [ "easy", "medium", "hard" ],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    limits: {
        time: {
            type: Number,
            required: true,
            min: 1
        },
        memory: {
            type: Number,
            required: true,
            min: 1
        }
    },
    constriants: {
        type: String
    }
}, {
    timestamps: true
});

ProblemSchema.index({ slug: 1 });

const Problem = model("Problem", ProblemSchema, "Problems");

export default Problem;