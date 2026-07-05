import { useParams } from "react-router-dom";
import { useSubmission } from "../hooks/submission.hook.js";

const SubmissionPage = () => {
    const { submissionId } = useParams();
    const { data: submission, isLoading, error } = useSubmission(submissionId);

    if (isLoading) return <p>Loading...</p>;

    if (error) return <p>Error fetching submission: {error.message}</p>;

    return (
        <>
            <p>{submission.id}</p>
            <p>{submission.problemId}</p>
            <p>{submission.createdAt}</p>
            <p>{submission.language}</p>
            <p>{submission.status}</p>
            <p>{submission.code}</p>
            <p>{JSON.stringify(submission.failedTestcase)}</p>
        </>
    );
};

export default SubmissionPage;
