export const queryKeys = {
    user: ["user"],
    problems: {
        all: ["problems"],
        detail: (problemId) => ["problems", problemId],
    },
    submissions: ["submissions"],
};
