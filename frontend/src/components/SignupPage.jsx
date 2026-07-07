import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import SignupSchema from "../schemas/signup.schema.js";
import { useProfile, useSignup } from "../hooks/auth.hooks.js";
import { useEffect } from "react";
import { continueWithGithub, continueWithGoogle } from "../api/auth.api.js";

const SignupPage = () => {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm({
        resolver: zodResolver(SignupSchema),
    });

    const navigate = useNavigate();
    const signupMutation = useSignup();
    const { data, error: _error, isLoading } = useProfile();

    const onSubmit = async (formData) => {
        await signupMutation.mutateAsync(formData, {
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
                <input type="text" {...register("name")} />
                {errors.name && <p>{errors.name.message}</p>}
                <input type="email" {...register("email")} />
                {errors.email && <p>{errors.email.message}</p>}
                <input type="password" {...register("password")} />
                {errors.password && <p>{errors.password.message}</p>}
                <input type="submit" value="Signup" disabled={isSubmitting} />
                <span>{isSubmitting ? "*" : ""}</span>
            </form>
            <button onClick={continueWithGoogle}>Continue with Google</button>
            <button onClick={continueWithGithub}>Continue with Github</button>
        </>
    );
};

export default SignupPage;
