import { useNavigate, useParams } from "react-router-dom";
import { useProblem } from "../hooks/problems.hook";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SubmissionSchema from "../schemas/submission.schema";
import { useSubmission } from "../hooks/submission.hook";
import readFile from "../lib/readFile.js";

const ProblemPage = () => {
    const navigate = useNavigate();

    const { problemId } = useParams();
    const { data: problem, isLoading, error } = useProblem(problemId);

    const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm({
        resolver: zodResolver(SubmissionSchema)
    });

    const submissionMutation = useSubmission();

    const onSubmit = async ({ file, language }) => {
        const code = await readFile(file);
        await submissionMutation.mutateAsync({ problemId: problem.id, code, language }, {
            onSuccess: () => {
                navigate("/submissions");
            },
            onError: (error) => {
                alert(error.message);
            }
        });
    };

    if (isLoading) return <p>Loading...</p>;

    if (error) return <p>Error fetching problem: {error.message}</p>;

    return (
        <>
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
                    {
                        problem.sampleTestcases.map((testcase, ind) => (
                            <tr key={ind}>
                                <td>{testcase.input}</td>
                                <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                <td>{testcase.output}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <form onSubmit={handleSubmit(onSubmit)}>
                <select defaultValue="None" {...register("language")}>
                    <option value="None">None</option>
                    <option value="python">Python</option>
                </select>
                { errors.language && <p>{errors.language.message}</p> }
                <input type="file" {...register("file")} />
                { errors.file && <p>{errors.file.message}</p> }
                <input type="submit" value="Submit" disabled={isSubmitting} />
                { isSubmitting && <p>*</p>}
            </form>
        </>
    );
};

export default ProblemPage;
