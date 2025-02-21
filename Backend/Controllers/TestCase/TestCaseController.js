import TestCase from '../../Models/TestCase/TestCase.js';

const Get = async (req, res) => {
    try
    {
        const testCases = await TestCase.find({ problemCode: req.params.problemCode });
        return res.json({
            success: true,
            message: "Test Cases fetched successfully",
            testCases
        });
    }
    catch(err)
    {
        return res.status(500).json({
            success: false,
            message: `Internal Server Error: ${err}`
        });
    }
};

const Add = async (req, res) => {
    try
    {
        const { testCaseId, problemCode, input, output, isSample, explanation } = req.body;
        const newTestCase = new TestCase({
            testCaseId,
            problemCode,
            input,
            output,
            isSample,
            explanation
        });

        await newTestCase.save();

        return res.json({
            success: true,
            message: "Test Case created successfully",
            testCase: {
                testCaseId,
                problemCode,
                input,
                output,
                isSample,
                explanation
            }
        });
    }
    catch(err)
    {
        return res.status(500).json({
            success: false,
            message: `Internal Server Error: ${err}`
        });
    }
};

export { Get, Add };