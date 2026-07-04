import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys.js";
import { submit } from "../api/submissions.api.js";

export const useSubmission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: submit,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.submissions,
            });
        },
    });
};
