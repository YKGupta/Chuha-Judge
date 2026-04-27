import Problem from "../../models/Problem/index.js";
import Testcase from "../../models/Testcase/index.js";
import User from "../../models/User/index.js";

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

const CreateProblemHandler = async (req, res) => {
    try
    {
        const body = req.body;

        if (!body.title || !body.slug || !body.difficulty || !body.description)
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Missing required fields",
                    code: "VALIDATION_ERROR"
                }
            });

        let problem = await Problem.findOne({ slug: body.slug });
        if(problem)
            return res.status(409).json({
                success: false,
                data: null,
                error: {
                    message: "Problem with this slug already exists",
                    code: "DUPLICATE_SLUG_ERROR"
                }
            });

        problem = new Problem(req.body);
        await problem.save();

        return res.json({
            success: true,
            data: null,
            error: null
        });
    }
    catch(e)
    {
        if (e.code === 11000)
            return res.status(409).json({
                success: false,
                data: null,
                error: {
                    message: "Problem with this slug already exists",
                    code: "DUPLICATE_SLUG_ERROR"
                }
            });

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

const UpdateProblemHandler = async (req, res) => {
    try
    {
        const slug = req.params.slug;

        let problem = await Problem.findOne({ slug });
        if(!problem)
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    message: "Problem with this slug does not exist",
                    code: "PROBLEM_NOT_FOUND"
                }
            });
            
        Object.assign(problem, req.body);
        await problem.save();

        return res.json({
            success: true,
            data: null,
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
}

const DeleteProblemHandler = async (req, res) => {
    try
    {
        const slug = req.params.slug;

        const problem = await Problem.findOne({ slug });
        if(!problem)
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    message: "Problem with this slug does not exist",
                    code: "PROBLEM_NOT_FOUND"
                }
            });

        await Problem.findByIdAndDelete(problem._id);

        return res.json({
            success: true,
            data: null,
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

export { GetProblemsHandler, GetProblemHandler, CreateProblemHandler, UpdateProblemHandler, DeleteProblemHandler };