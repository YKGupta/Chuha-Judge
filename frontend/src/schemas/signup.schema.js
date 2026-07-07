import { z } from "zod";

const SignupSchema = z.object({
    name: z.string().min(1, "Name cannot be empty"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be atleast 6 characters long"),
});

export default SignupSchema;
