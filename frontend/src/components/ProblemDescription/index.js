import React from 'react';
import styles from './ProblemDescription.module.css';
import { MathJaxContext, MathJax } from 'better-react-mathjax';
import { useOutletContext } from 'react-router-dom';

const config = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
    },
    options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
    },
};

const ProblemDescription = () => {

    const { problem } = useOutletContext();

    return (
        <div className={`${styles.problem}`}>
            <MathJaxContext config={config}>
                <h2>{problem.name}</h2>
                <p>{problem.limits.timeLimit} second{problem.limits.timeLimit > 1 ? 's' : ''} | {problem.limits.memoryLimit} MB</p>
                <MathJax dynamic>
                    {problem.problemStatement}
                </MathJax>
                <h3>Input</h3>
                <MathJax dynamic>
                    {problem.inputText}
                </MathJax>
                <h3>Output</h3>
                <MathJax dynamic>
                    {problem.outputText}
                </MathJax>
                <h3>Sample{problem.sampleTestCases.length > 1 ? 's' : ''}</h3>
                {
                    problem.sampleTestCases.map((val, ind) => <div key={ind} className={`${styles.testcase}`}>
                        <div>
                            <div>
                                <p>Input</p>
                                <button onClick={(ev) => { 
                                    if(ev.target.innerText !== "Copy")
                                        return;
                                    navigator.clipboard.writeText(val.input);
                                    ev.target.innerText = 'Copied!';
                                    setTimeout(() => ev.target.innerText = 'Copy', 2000);
                                }}>Copy</button>
                            </div>
                            <pre>{val.input}</pre>
                        </div>
                        <div>
                            <div>
                                <p>Output</p>
                                <button onClick={(ev) => { 
                                    if(ev.target.innerText !== "Copy")
                                        return;
                                    navigator.clipboard.writeText(val.output);
                                    ev.target.innerText = 'Copied!';
                                    setTimeout(() => ev.target.innerText = 'Copy', 2000);
                                }}>Copy</button>
                            </div>
                            <pre>{val.output}</pre>
                        </div>
                    </div>)
                }
            </MathJaxContext>
        </div>
    )
}

export default ProblemDescription;