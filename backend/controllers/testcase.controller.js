import { Types } from "mongoose";
import Problem from "../models/Problem.js";
import Testcase from "../models/Testcase.js";

const GetTestcasesForProblemHandler = async (req, res) => {
    try {
        const slug = req.params.slug;

        if (!slug)
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Problem identifier missing",
                    code: "PROBLEM_SLUG_MISSING",
                },
            });

        const problem = await Problem.findOne({ slug }, { _id: 1 }).lean();

        if (!problem)
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    message: "Problem not found",
                    code: "PROBLEM_NOT_FOUND",
                },
            });

        const testcases = await Testcase.find({
            problemId: problem._id,
        }).lean();

        if (testcases.length === 0)
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    message: "Testcases not found",
                    code: "TESTCASES_NOT_FOUND",
                },
            });

        return res.json({
            success: true,
            data: testcases.map((t) => ({
                id: t._id,
                input: t.input,
                output: t.output,
                isSample: t.isSample,
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

const CreateTestcaseHandler = async (req, res) => {
    try {
        if (!req.body.input || !req.body.output)
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Missing required fields",
                    code: "VALIDATION_ERROR",
                },
            });

        const slug = req.params.slug;

        if (!slug)
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Problem identifier missing",
                    code: "PROBLEM_SLUG_MISSING",
                },
            });

        const problem = await Problem.findOne({ slug }, { _id: 1 }).lean();

        if (!problem)
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    message: "Problem not found",
                    code: "PROBLEM_NOT_FOUND",
                },
            });

        const testcase = new Testcase({
            problemId: problem._id,
            ...req.body,
        });
        await testcase.save();

        return res.json({
            success: true,
            data: null,
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

const UpdateTestcaseHandler = async (req, res) => {
    try {
        const testcaseId = req.params.testcaseId;

        if (!testcaseId)
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Testcase identifier missing",
                    code: "TESTCASE_ID_MISSING",
                },
            });

        if (!Types.ObjectId.isValid(testcaseId))
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Invalid testcase ID",
                    code: "INVALID_TESTCASE_ID",
                },
            });

        const testcase = await Testcase.findById(testcaseId);

        if (!testcase)
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    message: "Testcase not found",
                    code: "TESTCASE_NOT_FOUND",
                },
            });

        const allowedUpdates = ["problemId", "input", "output", "isSample"];

        for (const key of allowedUpdates) {
            if (req.body[key] === undefined) continue;
            testcase[key] = req.body[key];
        }

        await testcase.save();

        return res.json({
            success: true,
            data: null,
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

const DeleteTestcaseHandler = async (req, res) => {
    try {
        const testcaseId = req.params.testcaseId;

        if (!testcaseId)
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Testcase identifier missing",
                    code: "TESTCASE_ID_MISSING",
                },
            });

        if (!Types.ObjectId.isValid(testcaseId))
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: "Invalid testcase ID",
                    code: "INVALID_TESTCASE_ID",
                },
            });

        const testcase = await Testcase.findById(testcaseId);

        if (!testcase)
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    message: "Testcase not found",
                    code: "TESTCASE_NOT_FOUND",
                },
            });

        await Testcase.findByIdAndDelete(testcase._id);

        return res.json({
            success: true,
            data: null,
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

export {
    GetTestcasesForProblemHandler,
    CreateTestcaseHandler,
    UpdateTestcaseHandler,
    DeleteTestcaseHandler,
};
