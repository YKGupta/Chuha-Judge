import Problem from "../../models/Problem.js";
import problems from "./data/problems.json" with { type: "json" };

export async function seedProblems() {
    await Problem.deleteMany();

    await Problem.insertMany(problems);

    console.log(`Seeded ${problems.length} problems`);
}
