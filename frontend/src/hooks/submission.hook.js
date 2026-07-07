import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys.js";
import {
    getSubmission,
    getSubmissions,
    submit,
} from "../api/submissions.api.js";

export const useSubmissions = () => {
    return useQuery({
        queryKey: queryKeys.submissions.all,
        queryFn: getSubmissions,
    });
};

export const useSubmission = (submissionId) => {
    return useQuery({
        queryKey: queryKeys.submissions.detail(submissionId),
        queryFn: () => getSubmission(submissionId),
    });
};

export const useCreateSubmission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: submit,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.submissions.all,
            });
        },
    });
};
