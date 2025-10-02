/**
 * Service for communicating with the container execution service.
 */
class ContainerService {

    static CONTAINER_SERVICE_URL = process.env.CONTAINER_SERVICE_URL || "http://localhost:5000/run";

    /**
     * Executes code in a containerized environment.
     * @param {string} code - Source code to execute.
     * @param {string} language - Programming language of the code.
     * @param {string} input - Input to provide to the program.
     * @returns {Promise<Object>} Execution result containing stdout, stderr, and exitCode.
     */
    static async executeCode(code, language, input) {
        try
        {
            const response = await fetch(this.CONTAINER_SERVICE_URL, {
                method: "POST",
                body: JSON.stringify({ code, language, input }),
                headers: { 'Content-Type': 'application/json' }
            });

            if(!response.ok)
                throw new Error(`Container service returned status ${response.status}`);

            const result = await response.json();
            return result;
        }
        catch(err)
        {
            console.error('Error communicating with container service:', err.message);
            throw err;
        }
    }
}

export default ContainerService;

