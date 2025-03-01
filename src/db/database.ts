// for the db connection (w/ prisma)

import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient({
    datasources :{
        db: {
            url: config.databaseUrl,
        }
    }
});

export async function connectToDatabase(){
    try {
        await prisma.$connect();
        console.log("Successfully connected to the database");
    } catch (error) {
        console.error("Database Connection Error: ", error);
        process.exit(1); //this will close the cli-program in case of error
    }
}

export default prisma;