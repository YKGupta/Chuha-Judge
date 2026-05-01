const isDev = process.env.NODE_ENV === "development";

const EnqueueSubmission = async (submissionId) => {
    if(isDev)
    {
        // TODO: Directly send submission for execution
    }
    else
    {
        // TODO: Queue the submission to GCP Task Queue
    }
};

export default EnqueueSubmission;