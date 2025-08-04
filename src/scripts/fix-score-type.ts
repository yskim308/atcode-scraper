import { mongoService } from "../sevices/MongoService";
import type { Collection, Db } from "mongodb";

const db: Db = mongoService.getDb();
const collection: Collection = db.collection("tasks");

await collection.updateMany(
  { score: { $type: "string" } }, // Only update documents where score is a string
  [
    {
      $set: {
        score: { $toInt: "$score" },
      },
    },
  ],
);

mongoService.disconnect();
