import axios from "axios";

export const login = async ({ email, password }) => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
            email,
            password,
        },
        {
            withCredentials: true,
        }
    );

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data;
};

export const signup = async ({ name, email, password }) => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
            name,
            email,
            password,
        },
        {
            withCredentials: true,
        }
    );

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data;
};
