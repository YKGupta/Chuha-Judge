import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from "react-router-dom";
import LoginSchema from '../schemas/login.schema.js';

const LoginPage = () => {

    const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm({
        resolver: zodResolver(LoginSchema)
    });
    const navigate = useNavigate();

    const onSubmit = async (formData) => {
        try {
            const r = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });
            const response = await r.json();
            if (!response.success) throw new Error(response.error.code);
            else navigate("/problems");
        } catch (e) {
            alert(JSON.stringify(e.message));
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="email"
                    {...register("email")}
                />
                {errors.email && <p>{errors.email.message}</p>}
                <input
                    type="password"
                    {...register("password")}
                />
                {errors.password && <p>{errors.password.message}</p>}
                <input
                    type="submit"
                    value="Login"
                    disabled={isSubmitting}
                />
                <span>{isSubmitting ? "*" : ""}</span>
            </form>
        </>
    );
};

export default LoginPage;
