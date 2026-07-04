import axios from "axios";

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
