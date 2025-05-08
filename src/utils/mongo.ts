import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongoDB(): Promise<Db> {
    if (db && client) {
        return db;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db();
        console.log('Connected to MongoDB successfully');
        return db;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

export async function closeMongoDBConnection(): Promise<void> {
    if (!client) return;

    try {
        await client.close();
        client = null;
        db = null;
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        throw error;
    }
}


export type Database = Awaited<ReturnType<typeof connectToMongoDB>>;
