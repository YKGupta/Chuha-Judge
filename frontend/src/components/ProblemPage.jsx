import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProblemPage = () => {
    const { problemId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [problem, setProblem] = useState(null);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setIsLoading(true);
                const r = await fetch(
                    `http://localhost:8080/api/problems/${problemId}`
                );
                const problem = await r.json();
                if (!problem.success) throw new Error(problem.error.code);
                setProblem(problem);
                console.log(problem);
            } catch (e) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProblem();
    }, [problemId]);

    return (
        <>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {error ? (
                        <p style={{ color: "red" }}>{error}</p>
                    ) : (
                        <>
                            <p>{problem.data.title}</p>
                            <p>{problem.data.description}</p>
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default ProblemPage;
