import { authenticatedApi } from "../lib/axios";

export const getSubmissions = async () => {
    const response = await authenticatedApi.get("/submissions");

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};

export const getSubmission = async (submissionId) => {
    const response = await authenticatedApi.get(`/submissions/${submissionId}`);

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};

export const submit = async ({ problemId, code, language }) => {
    const response = await authenticatedApi.post("/submissions", {
        problemId,
        code,
        language,
    });

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};
