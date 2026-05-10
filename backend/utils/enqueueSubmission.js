const isDev = process.env.NODE_ENV === "development";

const EnqueueSubmission = async (submissionId) => {
    if (isDev) {
        const result = await InvokeExecutionService(submissionId);
        if (!result.success) throw new Error(result.error.message);
        return result;
    } else {
        // TODO: Queue the submission to GCP Task Queue
        return {
            success: true,
        };
    }
};

const InvokeExecutionService = async (submissionId) => {
    try {
        const executionUrl = process.env.EXECUTION_SERVICE_URL;

        const r = await fetch(`${executionUrl}/${submissionId}`, {
            method: "POST",
        });

        const response = await r.json();

        if (!r.ok)
            throw new Error(response?.error?.message || "Execution failed");

        return {
            success: true,
            data: response,
            error: null,
        };
    } catch (e) {
        return {
            success: false,
            data: null,
            error: {
                message: e.message || "Internal Server Error",
                code: "EXECUTION_SERVICE_ERROR",
            },
        };
    }
};

export default EnqueueSubmission;
