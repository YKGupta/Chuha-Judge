import { authenticatedApi, publicApi } from "../lib/axios.js";

export const login = async ({ email, password }) => {
    const response = await publicApi.post("/auth/login", {
        email,
        password,
    });

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};

export const signup = async ({ name, email, password }) => {
    const response = await publicApi.post("/auth/register", {
        name,
        email,
        password,
    });

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};

export const continueWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/oauth/google`;
};

export const continueWithGithub = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/oauth/github`;
};

export const getProfile = async () => {
    const response = await authenticatedApi.get("/auth/profile");

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};

export const logout = async () => {
    const response = await authenticatedApi.post("/auth/logout");

    if (!response.data.success) {
        throw new Error(response.data.error.code);
    }

    return response.data.data;
};
