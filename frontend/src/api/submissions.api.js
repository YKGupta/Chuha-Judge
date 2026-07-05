import axios from "axios";

export const getSubmissions = async () => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/submissions`,
        {
            withCredentials: true
        }
    );

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};

export const getSubmission = async (submissionId) => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/submissions/${submissionId}`,
        {
            withCredentials: true
        }
    );

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};

export const submit = async ({ problemId, code, language }) => {
    console.log(code);
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/submissions`,
        {
            problemId,
            code,
            language,
        },
        {
            withCredentials: true,
        }
    );

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};
