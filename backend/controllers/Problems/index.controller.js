import Problem from "../../models/Problem/index.js";
import Testcase from "../../models/Testcase/index.js";

const GetProblemsHandler = async (req, res) => {
    try
    {
        const problems = await Problem.find({}, {
            title: 1,
            slug: 1,
            difficulty: 1
        }).lean();

        return res.json({
            success: true,
            data: problems.map(p => ({
                id: p._id,
                title: p.title,
                slug: p.slug,
                difficulty: p.difficulty
            })),
            error: null
        });
    }
    catch(e)
    {
        return res.status(500).json({
            success: false,
            data: null,
            error: {
                message: e.message || "Internal Server Error",
                code: "INTERNAL_SERVER_ERROR"
            }
        });
    }
};

const GetProblemHandler = async (req, res) => {
    
    try
    {
        const slug = req.params.slug;
        if(!slug)
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Problem identifier missing",
                    code: "PROBLEM_SLUG_MISSING"
                }
            })
        
        const problem = await Problem.findOne({ slug }).lean();

        if(!problem)
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    message: "Problem not found",
                    code: "PROBLEM_NOT_FOUND"
                }
            })
        
        const { _id, __v, ...rest } = problem;

        const testcases = await Testcase.find({
            problemId: _id,
            isSample: true
        }).lean();

        if(testcases.length === 0)
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    message: "Sample testcases not found",
                    code: "SAMPLE_TESTCASES_NOT_FOUND"
                }
            });

        const data = {
            id: _id,
            ...rest,
            sampleTestcases: testcases.map(t => ({
                input: t.input,
                output: t.output
            }))
        };

        return res.json({
            success: true,
            data,
            error: null
        });
    }
    catch(e)
    {
        return res.status(500).json({
            success: false,
            data: null,
            error: {
                message: e.message || "Internal Server Error",
                code: "INTERNAL_SERVER_ERROR"
            }
        });
    }
};

export { GetProblemsHandler, GetProblemHandler };