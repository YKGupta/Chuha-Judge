const ProblemLoader = async ({ params }) => {
    return await ((await fetch(`${process.env.REACT_APP_BACKEND_HOST}/problems/get/${params.code}`)).json());
};

export default ProblemLoader;