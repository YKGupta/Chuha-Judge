import { model, Schema } from "mongoose";

const TestcaseSchema = Schema(
    {
        problemId: {
            type: Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
        },
        input: {
            type: String,
            required: true,
        },
        output: {
            type: String,
            required: true,
        },
        isSample: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

TestcaseSchema.index({ problemId: 1, isSample: 1 });

const Testcase = model("Testcase", TestcaseSchema, "Testcases");

export default Testcase;
