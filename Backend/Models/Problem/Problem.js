import mongoose, { model, Schema } from 'mongoose';

const ProblemSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    problemStatement: {
        type: String,
        required: true,
    },
    inputText: {
        type: String,
        required: true
    },
    outputText: {
        type: String,
        required: true
    },
    limits: {
        timeLimit: {
            type: Number,
            required: true
        },
        memoryLimit: {
            type: Number,
            required: true
        }
    },
    sampleTestCases: [ { 
        type: mongoose.Types.ObjectId,
        ref: "TestCase"
    } ]
});

const Problem = model('Problem', ProblemSchema, 'Problems');
export default Problem;