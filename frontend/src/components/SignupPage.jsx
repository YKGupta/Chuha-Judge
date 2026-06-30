import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import SignupSchema from "../schemas/signup.schema.js";

const SignupPage = () => {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm({
        resolver: zodResolver(SignupSchema),
    });
    const navigate = useNavigate();

    const onSubmit = async (formData) => {
        try {
            console.log(formData);
            const r = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: formData.name,
                        email: formData.email,
                        password: formData.password,
                    }),
                }
            );

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
