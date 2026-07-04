import axios from "axios";

export const getProblems = async () => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/problems`
    );

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};

export const getProblem = async (problemId) => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/problems/${problemId}`
    );

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};
