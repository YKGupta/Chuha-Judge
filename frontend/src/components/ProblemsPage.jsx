import { Link } from "react-router-dom";
import { useProblems } from "../hooks/problems.hook";

const ProblemsPage = () => {
    const { data: problems, isLoading, error } = useProblems();

    if (isLoading) return <p>Loading...</p>;

    if (error) return <p>Error fetching problems: {error.message}</p>;

    return (
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Difficulty</th>
                </tr>
            </thead>
            <tbody>
                {problems.map((problem) => {
                    return (
                        <tr key={problem.slug}>
                            <td>
                                <Link to={`/problems/${problem.slug}`}>
                                    {problem.title}
                                </Link>
                            </td>
                            <td>{problem.difficulty}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default ProblemsPage;
