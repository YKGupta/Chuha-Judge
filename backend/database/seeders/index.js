import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../connect.js";

import { seedUsers } from "./users.seed.js";
import { seedProblems } from "./problems.seed.js";
import { seedTestcases } from "./testcases.seed.js";

async function main() {
    try {
        await connectDB();

        console.log("Seeding database...");

        await seedUsers();
        await seedProblems();
        await seedTestcases();

        console.log("Database seeded successfully.");
    } catch (err) {
        console.error("Seeding failed:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

main();
