import React, { useState } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import styles from './Problem.module.css';
import { Java, Python } from '../../utility/DefaultLanguageCodes';

const Problem = () => {

    const problem = useLoaderData().problem;
    const [ language, setLanguage ] = useState("java");
    const [ code, setCode ] = useState(localStorage.getItem('java') || Java);

    const onChange = (val) => {
        setCode(val);
        localStorage.setItem(language, val);
    };

    return (
        <div className={`${styles.problemContainer}`}>
            <Outlet context={{ problem }} />
            <div className={`${styles.editor}`}>
                <div>
                    <select name="language" onChange={(ev) => {
                        setLanguage(ev.target.value);
                        if(!localStorage.getItem(ev.target.value))
                            setCode(ev.target.value === "java" ? Java : Python);
                        else
                            setCode(localStorage.getItem(ev.target.value));
                    }}>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                    </select>
                </div>
                <Editor height="60vh" width="50vw" language={language} value={code} onChange={onChange} />
                <div className={`${styles.runBtn}`}>
                    <button>Run</button>
                </div>
            </div>
        </div>
    )
}

export default Problem;