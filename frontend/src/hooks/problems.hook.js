import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { getProblem, getProblems } from "../api/problems.api";

export const useProblems = () => {
    return useQuery({
        queryKey: queryKeys.problems.all,
        queryFn: getProblems,
    });
};

export const useProblem = (problemId) => {
    return useQuery({
        queryKey: queryKeys.problems.detail(problemId),
        queryFn: () => getProblem(problemId),
        enabled: !!problemId,
    });
};
