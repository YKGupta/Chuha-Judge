import { Link } from "react-router-dom";
import { useSubmissions } from "../hooks/submission.hook";

const SubmissionsPage = () => {
    const { data: submissions, isLoading, error } = useSubmissions();

    if (isLoading) return <p>Loading...</p>;

    if (error) return <p>Error fetching submissions: {error.message}</p>;

    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>When</th>
                    <th>Problem</th>
                    <th>Lang</th>
                    <th>Verdict</th>
                    <th>Time</th>
                    <th>Memory</th>
                </tr>
            </thead>
            <tbody>
                {submissions.map((submission) => {
                    return (
                        <tr key={submission.id}>
                            <td>
                                <Link to={`/submissions/${submission.id}`}>
                                    {submission.id}
                                </Link>
                            </td>
                            <td>{submission.createdAt}</td>
                            <td>{submission.problemId}</td>
                            <td>{submission.language}</td>
                            <td>{submission.status}</td>
                            <td>{submission.execution.time}</td>
                            <td>{submission.execution.memory}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default SubmissionsPage;
