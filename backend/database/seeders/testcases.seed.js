import Problem from "../../models/Problem.js";
import Testcase from "../../models/Testcase.js";

const testcaseData = {
    "two-sum": [
        {
            input: "4\n2 7 11 15\n9",
            output: "0 1",
            isSample: true,
        },
        {
            input: "3\n3 2 4\n6",
            output: "1 2",
        },
        {
            input: "2\n3 3\n6",
            output: "0 1",
        },
    ],

    "valid-parentheses": [
        {
            input: "()",
            output: "true",
            isSample: true,
        },
        {
            input: "()[]{}",
            output: "true",
        },
        {
            input: "(]",
            output: "false",
        },
        {
            input: "([)]",
            output: "false",
        },
    ],

    "binary-search": [
        {
            input: "5\n1 3 5 7 9\n7",
            output: "3",
            isSample: true,
        },
        {
            input: "5\n1 3 5 7 9\n2",
            output: "-1",
        },
    ],

    "merge-intervals": [
        {
            input: "4\n1 3\n2 6\n8 10\n15 18",
            output: "1 6\n8 10\n15 18",
            isSample: true,
        },
        {
            input: "2\n1 4\n4 5",
            output: "1 5",
        },
    ],

    "median-of-two-sorted-arrays": [
        {
            input: "1 3\n2",
            output: "2.0",
            isSample: true,
        },
        {
            input: "1 2\n3 4",
            output: "2.5",
        },
    ],
};

export async function seedTestcases() {
    await Testcase.deleteMany();

    const problems = await Problem.find({}, "_id slug");

    const docs = [];

    for (const problem of problems) {
        const testcases = testcaseData[problem.slug] || [];

        for (const tc of testcases) {
            docs.push({
                problemId: problem._id,
                ...tc,
            });
        }
    }

    await Testcase.insertMany(docs);

    console.log(`Seeded ${docs.length} testcases`);
}
