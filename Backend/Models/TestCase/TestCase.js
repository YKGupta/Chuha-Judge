import { model, Types, Schema } from "mongoose";

const TestCaseSchema = Schema({
    testCaseId: {
        type: Number,
        required: true
    },
    problem: {
        type: Types.ObjectId,
        ref: 'Problems',
        required: true
    },
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    },
    isSample: {
        type: Boolean,
        required: true
    },
    explanation: {
        type: String,
        default: ""
    }
});

const TestCase = model('TestCase', TestCaseSchema, 'TestCases');

export default TestCase;