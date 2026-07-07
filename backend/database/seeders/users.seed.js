import { hash } from "bcrypt";
import User from "../../models/User.js";
import users from "./data/users.json" with { type: "json" };

export async function seedUsers() {
    await User.deleteMany();

    const seededUsers = await Promise.all(
        users.map(async (user) => ({
            ...user,
            password: await hash(user.password, 10),
        }))
    );

    await User.insertMany(seededUsers);

    console.log(`Seeded ${seededUsers.length} users`);
}
