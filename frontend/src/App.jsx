import { NavLink } from "react-router-dom";
import "./App.css";

function App() {
    const isAuthenticated = false;

    return (
        <>
            {isAuthenticated ? (
                <NavLink to="/problems" end>
                    Problems
                </NavLink>
            ) : (
                <>
                    <NavLink to="/login" end>
                        Login
                    </NavLink>
                    <NavLink to="/signup" end>
                        Signup
                    </NavLink>
                </>
            )}
        </>
    );
}

export default App;
