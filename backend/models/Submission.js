import { model, Schema } from "mongoose";

const FailedTestcaseSchema = Schema({
    input: {
        type: String,
    },
    expectedOutput: {
        type: String,
    },
    actualOutput: {
        type: String,
    },
    stderr: {
        type: String,
    },
});

const SubmissionSchema = Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        problemId: {
            type: Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            required: true,
            enum: ["java", "python"],
        },
        status: {
            type: String,
            default: "pending",
            enum: [
                "pending",
                "running",
                "accepted",
                "wrong_answer",
                "time_limit_exceeded",
                "runtime_error",
                "compilation_error",
            ],
        },
        execution: {
            time: {
                type: Number,
            },
            memory: {
                type: Number,
            },
        },
        failedTestcase: {
            type: FailedTestcaseSchema,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

SubmissionSchema.index({ userId: 1, problemId: 1 });
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ userId: 1, createdAt: -1 });

const Submission = model("Submission", SubmissionSchema, "Submissions");

export default Submission;
