/**
 * Normalizes output by removing carriage returns and trimming whitespace.
 * @param {string} output - Output string to normalize.
 * @returns {string} Normalized output.
 */
const NormalizeOutput = (output) => {
    if(!output)
        return '';
    
    return output.replace(/\r\n/g, '\n').trim();
};

/**
 * Calculates the verdict based on execution result and expected output.
 * @param {number} exitCode - Exit code from program execution.
 * @param {string} stdout - Standard output from program.
 * @param {string} expectedOutput - Expected output for comparison.
 * @returns {string} Verdict: 'AC' (Accepted), 'WA' (Wrong Answer), or 'RE' (Runtime Error).
 */
const CalculateVerdict = (exitCode, stdout, expectedOutput) => {
    if(exitCode !== 0)
        return 'RE';
    
    const normalizedOutput = NormalizeOutput(stdout);
    const normalizedExpected = NormalizeOutput(expectedOutput);

    return normalizedOutput === normalizedExpected ? 'AC' : 'WA';
};

export { NormalizeOutput, CalculateVerdict };

