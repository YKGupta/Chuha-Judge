const isDev = process.env.NODE_ENV === "development";

const EnqueueSubmission = async (submissionId) => {
    if(isDev)
    {
        const result = await InvokeExecutionService(submissionId);
        if(!result.success)
            throw new Error(result.error.message);
        return result;
    }
    else
    {
        // TODO: Queue the submission to GCP Task Queue
        return ({
            success: true
        });
    }
};

const InvokeExecutionService = async (submissionId) => {
    try
    {
        const executionUrl = process.env.EXECUTION_SERVICE_URL;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const r = await fetch(executionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                submissionId
            }),
            signal: controller.signal
        });
        
        const response = await r.json();

        if(!r.ok)
            throw new Error(response?.error?.message || "Execution failed");

        clearTimeout(timeout);

        return ({
            success: true,
            data: response,
            error: null
        });
    }
    catch(e)
    {
        return ({
            success: false,
            data: null,
            error: {
                message: e.message || "Internal Server Error",
                code: "EXECUTION_SERVICE_ERROR"
            }
        });
    }
};

export default EnqueueSubmission;