const LoginHandler = async ({ email, password }, navigate) => {
    const url = `${process.env.REACT_APP_BACKEND_HOST}/users/login`;
    try
    {
        const response = await (await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password })
        })).json();

        if(response.success)
        {
            localStorage.setItem('token', response.token);
            navigate('/problems');
        }
        else
            throw new Error(response.message);
    }
    catch(err)
    {
        console.log('Error', JSON.stringify(err));
    }
};

export default LoginHandler;