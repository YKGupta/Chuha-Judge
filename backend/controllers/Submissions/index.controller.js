import Submission from "../../models/Submission/index.js";

const GetSubmissions = async (req, res) => {
    try
    {
        const submissions = await Submission.find({ userId: req.user.userId }).sort({ createdAt: -1 }).lean();
        return res.json({
            success: true,
            data: submissions.map(s => ({
                id: s._id,
                problemId: s.problemId,
                language: s.language,
                status: s.status,
                execution: s.execution,
                createdAt: s.createdAt
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

const CreateSubmission = async (req, res) => {
    try
    {
        const { problemId, code, language } = req.body;

        if(!problemId || !code || !langugage)
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Missing required fields",
                    code: "VALIDATION_ERROR"
                }
            });
                    
        if(!Types.ObjectId.isValid(problemId))
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Invalid problem ID",
                    code: "INVALID_PROBLEM_ID"
                }
            });
        
        const submission = new Submission({
            userId: req.user.userId,
            problemId,
            code,
            language
        });
        await submission.save();

        // TODO: publish submission to Pub/Sub

        return res.json({
            success: true,
            data: {
                submissionId: submission._id
            },
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

export { GetSubmissions, CreateSubmission };