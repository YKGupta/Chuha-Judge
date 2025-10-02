import ContainerService from '../../services/ContainerService/index.js';
import { NormalizeOutput, CalculateVerdict } from '../../utils/OutputComparator/index.js';

/**
 * Handles code submission and execution. The params mentioned are request body.
 * @param {string} code - Source code to execute.
 * @param {string} language - Programming language of the code.
 * @param {string} input - Input to provide to the program.
 * @param {string} expectedOutput - Expected output for comparison.
 */
const SubmitHandler = async (req, res) => {

    const { code, language, input = '', expectedOutput = '' } = req.body;

    try
    {
        if(!code || !language)
            return res.status(400).json({
                success: false,
                message: "Code and language are required!"
            });

        const result = await ContainerService.executeCode(code, language, input);

        if(!result)
            return res.status(500).json({
                success: false,
                message: "Failed to execute code!"
            });

        const { stdout, stderr, exitCode } = result;

        const verdict = CalculateVerdict(exitCode, stdout, expectedOutput);

        return res.json({
            success: true,
            message: "Code executed successfully!",
            verdict,
            stdout,
            stderr,
            exitCode
        });
    }
    catch(err)
    {
        res.status(500).json({
            success: false,
            message: JSON.stringify(err)
        });
    }
};

export { SubmitHandler };

