import axios from "axios";

const authenticatedApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

authenticatedApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            (error.response?.status === 400 ||
                error.response?.status === 401) &&
            !originalRequest._retry && originalRequest.url !== "/auth/refresh-token"
        ) {
            originalRequest._retry = true;
            await authenticatedApi.post("/auth/refresh-token");
            return authenticatedApi(originalRequest);
        }

        return Promise.reject(error);
    }
);

export { authenticatedApi, publicApi };
