import { Link, useNavigate, useParams } from "react-router-dom";
import { useProblem } from "../hooks/problems.hook";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmissionSchema from "../schemas/submission.schema";
import { useCreateSubmission } from "../hooks/submission.hook";
import readFile from "../lib/readFile.js";
import { useLogout, useProfile } from "../hooks/auth.hooks.js";

const ProblemPage = () => {
    const navigate = useNavigate();

    const { problemSlug } = useParams();
    const { data: problem, isLoading, error } = useProblem(problemSlug);
    const { data, isLoading: profileIsLoading, error: _error } = useProfile();

    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm({
        resolver: zodResolver(SubmissionSchema),
    });

    const submissionMutation = useCreateSubmission();
    const logoutMutation = useLogout();

    const handleLogout = async () => {
        await logoutMutation.mutateAsync(null, {
            onSuccess: () => {
                navigate("/login");
            },
            onError: (error) => {
                alert(error.message);
            },
        });
    };

    const onSubmit = async ({ file, language }) => {
        const code = await readFile(file);
        await submissionMutation.mutateAsync(
            { problemId: problem.id, code, language },
            {
                onSuccess: () => {
                    navigate("/submissions");
                },
                onError: (error) => {
                    alert(error.message);
                },
            }
        );
    };

    if (isLoading || profileIsLoading) return <p>Loading...</p>;

    if (error) return <p>Error fetching problem: {error.message}</p>;

    return (
        <>
            {profileIsLoading ? (
                <p>Loading...</p>
            ) : data ? (
                <>
                    <p>
                        {data.user.username} - {data.user.email}
                    </p>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Signup</Link>
                </>
            )}
            <p>{problem.title}</p>
            <p>{problem.description}</p>
            <table>
                <thead>
                    <tr>
                        <th>Input</th>
                        <th></th>
                        <th>Output</th>
                    </tr>
                </thead>
                <tbody>
                    {problem.sampleTestcases.map((testcase, ind) => (
                        <tr key={ind}>
                            <td>{testcase.input}</td>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            <td>{testcase.output}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <>
                {data ? (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <select defaultValue="None" {...register("language")}>
                            <option value="None">None</option>
                            <option value="python">Python</option>
                        </select>
                        {errors.language && <p>{errors.language.message}</p>}
                        <input type="file" {...register("file")} />
                        {errors.file && <p>{errors.file.message}</p>}
                        <input
                            type="submit"
                            value="Submit"
                            disabled={isSubmitting}
                        />
                        {isSubmitting && <p>*</p>}
                    </form>
                ) : (
                    <p>Please login to submit</p>
                )}
            </>
        </>
    );
};

export default ProblemPage;
