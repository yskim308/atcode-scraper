import { mongoService } from "../sevices/MongoService";
import type { Collection, Db } from "mongodb";

(async () => {
  const db: Db = mongoService.getDb();
  const collection: Collection = db.collection("tasks");

  console.log("updating many:");
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

  console.log("done updating, disconnecting client");
  mongoService.disconnect();
})();
