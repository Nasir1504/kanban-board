import mongoose from "mongoose";
import { seedDatabase } from "../lib/seed.js";

await mongoose.connect(process.env.MONGODB_URI);

const { users, tasks } = await seedDatabase();

console.log(`seeded ${users} users, ${tasks} tasks`);
await mongoose.disconnect();
process.exit(0);
