import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import SignupSchema from "../schemas/signup.schema.js";
import { useSignup } from "../hooks/auth.hooks.js";

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
        </>
    );
};

export default SignupPage;
