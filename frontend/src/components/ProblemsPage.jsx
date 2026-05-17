import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ProblemsPage = () => {

    const [ problems, setProblems ] = useState([]);

    useEffect(() => {
        const getData = async () => {
            const r = await fetch('http://localhost:8080/api/problems');
            const response = await r.json();
            return response.data;
        };

        getData().then((x) => {
            setProblems(x);
        });

    }, []);

    return (
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Difficulty</th>
                </tr>
            </thead>
            <tbody>
                {
                    problems.map((problem) => {
                        return (<tr key={problem.slug}>
                            <td><Link to={`/problems/${problem.slug}`}>{problem.title}</Link></td>
                            <td>{problem.difficulty}</td>
                        </tr>);
                    })
                }
            </tbody>
        </table>
    );
};

export default ProblemsPage;