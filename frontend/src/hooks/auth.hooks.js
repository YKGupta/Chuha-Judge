import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, login, logout, signup } from "../api/auth.api";
import { queryKeys } from "../lib/queryKeys";

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: login,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.user,
            });
        },
    });
};

export const useSignup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: signup,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.user,
            });
        },
    });
};

export const useProfile = () => {
    return useQuery({
        queryKey: queryKeys.user,
        queryFn: getProfile,
    });
};

export const useLogout = () => {
    const queryClinet = useQueryClient();

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            queryClinet.removeQueries({
                queryKey: queryKeys.user,
            });
        },
    });
};
