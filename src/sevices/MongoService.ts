import { MongoClient } from "mongodb";
import type { Db } from "mongodb";
import type { Task } from "../types";
export class MongoService {
  private client: MongoClient;
  private db: Db;
  constructor() {
    const URI = process.env.MONGO_CLIENT_URI;
    if (!URI) {
      throw new Error("mongo client uri not set in .env");
    }
    this.client = new MongoClient(URI);
    const DB_NAME = process.env.MONGO_DB_NAME;
    if (!DB_NAME) {
      throw new Error("db name not set in .env");
    }
    this.db = this.client.db(DB_NAME);
  }

  async insertTasks(document: Task, collection: string) {
    const tasks = this.db.collection("tasks");
    const exists = await tasks.findOne({ id: document.id });
    if (exists) return;
    await tasks.insertOne(document);
  }

  async disconnect() {
    this.client.close();
  }
}
