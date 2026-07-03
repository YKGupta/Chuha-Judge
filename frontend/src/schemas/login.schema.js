import { z } from "zod";

const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be atleast 6 characters long"),
});

export default LoginSchema;
