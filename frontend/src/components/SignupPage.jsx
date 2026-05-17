import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        error: "",
    });

    const inputChangedHandler = (e) => {
        setFormData((p) => ({
            ...p,
            [e.target.name]: e.target.value
        }));
    };
    
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const HandleSubmit = async () => {
        try {
            setIsLoading(true);
            const r = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });
            const response = await r.json();
            if (!response.success) throw new Error(response.error.code);
            else navigate("/problems");
        } catch (e) {
            setFormData((p) => ({
                ...p,
                error: e.message
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <input
                type="text"
                name="name"
                id="name"
                onChange={inputChangedHandler}
                autoComplete="on"
            />
            <input
                type="email"
                name="email"
                id="email"
                onChange={inputChangedHandler}
                autoComplete="on"
            />
            <input
                type="password"
                name="password"
                id="password"
                onChange={inputChangedHandler}
                autoComplete="on"
            />
            <input
                type="submit"
                value="Submit"
                onClick={HandleSubmit}
                disabled={isLoading}
            />
            <span>{isLoading ? "*" : ""}</span>
            <p style={{ color: "red" }}>{formData.error}</p>
        </>
    );
};

export default SignupPage;
