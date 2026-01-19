import 'dotenv/config'; // ensures DATABASE_URL is loaded
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Read the connection string
const connectionString = process.env.DATABASE_URL!;

// Create an adapter instance
const adapter = new PrismaPg({ connectionString });

// Now construct PrismaClient with that adapter
const prisma = new PrismaClient({ adapter });

export default prisma;
