import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, signup } from "../api/auth.api";
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
