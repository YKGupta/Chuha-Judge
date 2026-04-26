const GetProblemsHandler = (req, res) => {
    res.json({
        success: true
    });
};

const GetProblemHandler = (req, res) => {
    const problemId = req.params.problemId;
    res.json({
        success: true
    });
};

export { GetProblemsHandler, GetProblemHandler };