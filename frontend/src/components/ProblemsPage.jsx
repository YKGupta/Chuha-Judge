import { Link, useNavigate } from "react-router-dom";
import { useProblems } from "../hooks/problems.hook";
import { useLogout, useProfile } from "../hooks/auth.hooks";

const ProblemsPage = () => {
    const { data: problems, isLoading, error } = useProblems();
    const { data, error: _error, isLoading: profileIsLoading } = useProfile();
    const navigate = useNavigate();
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

    if (isLoading) return <p>Loading...</p>;

    if (error) return <p>Error fetching problems: {error.message}</p>;

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
        </>
    );
};

export default ProblemsPage;
