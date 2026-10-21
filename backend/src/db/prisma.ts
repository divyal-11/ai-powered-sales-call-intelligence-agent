import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { PrismaClient, Prisma } from "../generated/prisma/client";

// Primary shared instance of PrismaClient (read/write operations)
// Log only errors and warnings (no query logging to stdout so stdio protocols like MCP remain clean)
const prisma = new PrismaClient({
  log: ["error", "warn"],
});


// Dedicated restricted read-only client for Natural Language & MCP queries
// Connects with READONLY_DATABASE_URL if available, falling back to DATABASE_URL or schema default
const readonlyUrl = process.env.READONLY_DATABASE_URL || process.env.DATABASE_URL;

const readonlyOptions: Prisma.PrismaClientOptions = {
  log: ["error", "warn"],
};

if (readonlyUrl) {
  readonlyOptions.datasourceUrl = readonlyUrl;
}

export const readonlyPrisma = new PrismaClient(readonlyOptions);

export default prisma;
