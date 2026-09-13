import { PrismaClient } from "../generated/prisma/client";


// We create ONE shared instance of PrismaClient for the whole app.
// Why? Prisma opens a connection pool to the DB. If you created a new
// PrismaClient() in every file that needs it, you would open hundreds
// of connection pools — which exhausts your database connections fast.
// The singleton pattern (one shared instance) prevents that.

const prisma = new PrismaClient({
  log: ["query", "error", "warn"], // logs every SQL query in dev — very helpful
});

export default prisma;
