import { Types } from "mongoose";
import Submission from "../models/Submission.js";
import EnqueueSubmission from "../utils/enqueueSubmission.js";

const GetSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .lean();
        return res.json({
            success: true,
            data: submissions.map((s) => ({
                id: s._id,
                problemId: s.problemId,
                language: s.language,
                status: s.status,
                execution: s.execution,
                createdAt: s.createdAt,
            })),
            error: null,
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            data: null,
            error: {
                message: e.message || "Internal Server Error",
                code: "INTERNAL_SERVER_ERROR",
            },
        });
    }
};

const GetSubmissionById = async (req, res) => {
    try {
        const submissionId = req.params.submissionId;
        if (!Types.ObjectId.isValid(submissionId))
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Invalid submission ID",
                    code: "INVALID_SUBMISSION_ID",
                },
            });

        const submission = await Submission.findById(submissionId).lean();

        if (!submission)
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    message: "Submission not found",
                    code: "SUBMISSION_NOT_FOUND",
                },
            });

        return res.json({
            success: true,
            data: {
                id: submission._id,
                problemId: submission.problemId,
                code: submission.code,
                language: submission.language,
                status: submission.status,
                execution: submission.execution,
                failedTestcase: submission.failedTestcase,
                createdAt: submission.createdAt,
            },
            error: null,
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            data: null,
            error: {
                message: e.message || "Internal Server Error",
                code: "INTERNAL_SERVER_ERROR",
            },
        });
    }
};

const CreateSubmission = async (req, res) => {
    let submissionId = null;

    try {
        const { problemId, code, language } = req.body;

        if (!problemId || !code || !language)
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Missing required fields",
                    code: "VALIDATION_ERROR",
                },
            });

        if (!Types.ObjectId.isValid(problemId))
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Invalid problem ID",
                    code: "INVALID_PROBLEM_ID",
                },
            });

        const submission = new Submission({
            userId: req.user.userId,
            problemId,
            code,
            language,
        });
        await submission.save();

        submissionId = submission._id;

        await EnqueueSubmission(submissionId);

        return res.json({
            success: true,
            data: {
                submissionId,
            },
            error: null,
        });
    } catch (e) {
        if (submissionId)
            await Submission.findByIdAndDelete(submissionId).catch(() => {});

        return res.status(500).json({
            success: false,
            data: null,
            error: {
                message: e.message || "Internal Server Error",
                code: "INTERNAL_SERVER_ERROR",
            },
        });
    }
};

export { GetSubmissions, GetSubmissionById, CreateSubmission };
