import mongoose from "mongoose";

// The models have to be imported somewhere for `mongoose.model("Task")` and the
// `ref`s used by `populate()` to resolve — this file is the one place every
// route already goes through, so it registers all three.
import "@/model/User";
import "@/model/Board";
import "@/model/Task";

// `next dev` re-evaluates modules on every edit, so the connection is parked on
// globalThis. Without it each hot reload would open a fresh pool.
const cached = (globalThis._mongoose ??= { conn: null, promise: null });

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  // bufferCommands:false makes a query fail fast instead of hanging for 10s
  // when the connection is down.
  cached.promise ??= mongoose.connect(uri, { bufferCommands: false });

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Drop the rejected promise so the next request retries the connect.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

export default connectDB;
