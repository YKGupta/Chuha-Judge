const ProblemsLoader = async () => {
    return await ((await fetch(`${process.env.REACT_APP_BACKEND_HOST}/problems/getAll`)).json());
};

export default ProblemsLoader;