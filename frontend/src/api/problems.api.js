import { publicApi } from "../lib/axios";

export const getProblems = async () => {
    const response = await publicApi.get("/problems");

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};

export const getProblem = async (problemId) => {
    const response = await publicApi.get(`/problems/${problemId}`);

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};
