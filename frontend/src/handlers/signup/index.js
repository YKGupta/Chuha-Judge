const SignupHandler = async ({ name, email, password }, navigate, dispatcher) => {
    const url = `${process.env.REACT_APP_BACKEND_HOST}/users/signup`;
    try
    {
        const response = await (await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password })
        })).json();

        if(response.success)
        {
            dispatcher({ type: "UPDATE_SIGNUP_MAIL", payload: { email }});
            navigate('/verify');
        }
        else
            throw new Error(response.message);
    }
    catch(err)
    {
        console.log('Error', JSON.stringify(err));
    }
};

export default SignupHandler;