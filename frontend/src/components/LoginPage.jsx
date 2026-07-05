import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import LoginSchema from "../schemas/login.schema.js";
import { useLogin, useProfile } from "../hooks/auth.hooks.js";
import { useEffect } from "react";

const LoginPage = () => {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm({
        resolver: zodResolver(LoginSchema),
    });

    const navigate = useNavigate();
    const loginMutation = useLogin();
    const { data, error: _error, isLoading } = useProfile();

    const onSubmit = async (formData) => {
        await loginMutation.mutateAsync(formData, {
            onSuccess: () => {
                navigate("/problems");
            },
            onError: (error) => {
                alert(error.message);
            },
        });
    };

    useEffect(() => {
        if (data) navigate("/problems");
    }, [data, navigate]);

    if (isLoading) return <p>Loading...</p>;

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input type="email" {...register("email")} />
                {errors.email && <p>{errors.email.message}</p>}
                <input type="password" {...register("password")} />
                {errors.password && <p>{errors.password.message}</p>}
                <input type="submit" value="Login" disabled={isSubmitting} />
                <span>{isSubmitting ? "*" : ""}</span>
            </form>
        </>
    );
};

export default LoginPage;
