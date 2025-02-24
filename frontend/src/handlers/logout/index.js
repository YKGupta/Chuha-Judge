const LogoutHandler = (navigate) => {
    localStorage.removeItem('token');
    navigate('/login');
};

export default LogoutHandler;