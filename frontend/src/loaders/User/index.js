const UserLoader = async () => {
    if(!localStorage.getItem('token'))
        return {};
    return await ((await fetch(`${process.env.REACT_APP_BACKEND_HOST}/users/get`, {
        method: "GET",
        headers: {
            "token": localStorage.getItem('token')
        }
    })).json());
};

export default UserLoader;