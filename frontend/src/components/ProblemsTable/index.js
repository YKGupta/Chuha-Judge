import React from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import styles from './ProblemsTable.module.css';

const ProblemsTable = () => {

    const problems = useLoaderData().problems;
    const navigate = useNavigate();

    return (
        <table className={`${styles.table}`}>
            <thead>
                <tr>
                    <th style={{width: '8%'}}>S. No</th>
                    <th style={{width: '15%'}}>Problem Code</th>
                    <th>Problem Name</th>
                </tr>
            </thead>
            <tbody>
                {
                    problems.map((value, ind) => <tr key={ind} onClick={() => navigate(`/problems/${value.code}`)}>
                        <td>{ind + 1}</td>
                        <td>{value.code}</td>
                        <td>{value.name}</td>
                    </tr>)
                }
            </tbody>
        </table>
    )
}

export default ProblemsTable;