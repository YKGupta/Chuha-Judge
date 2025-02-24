import Problem from '../../Models/Problem/Problem.js';

const Get = async (req, res) => {
    try
    {
        const problem = await Problem.findOne({ code: req.params.code }).populate('sampleTestCases');
        if(!problem)
            return res.json({
                success: false,
                message: "Problem not found"
            });
        return res.json({
            success: true,
            message: "Problem found successfully",
            problem: {
                code: problem.code,
                name: problem.name,
                problemStatement: problem.problemStatement,
                inputText: problem.inputText,
                outputText: problem.outputText,
                limits: problem.limits,
                sampleTestCases: problem.sampleTestCases
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

const GetAll = async (req, res) => {
    try
    {
        const problems = await Problem.find({});
        return res.json({
            success: true,
            message: "Problems found successfully",
            problems
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
        const { code, name, problemStatement, inputText, outputText, limits, sampleTestCases } = req.body;
        const oldProblem = await Problem.findOne({ code });
        if(oldProblem)
            return res.json({
                success: false,
                message: "Problem with this code already exists"
            });

        const newProblem = new Problem({
            code,
            name,
            problemStatement,
            inputText,
            outputText,
            limits,
            sampleTestCases
        });

        await newProblem.save();

        return res.json({
            success: true,
            message: "Problem created successfully",
            problem: { code, name, problemStatement, inputText, outputText, limits, sampleTestCases }
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

export { Get, GetAll, Add };