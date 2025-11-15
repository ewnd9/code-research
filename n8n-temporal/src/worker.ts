import { NativeConnection, Worker } from "@temporalio/worker";
import * as aiActivities from "./activities/ai.activities";
import * as n8nActivities from "./activities/n8n.activities";

async function run() {
  // Connect to Temporal server
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
  });

  console.log("Connected to Temporal server");

  // Create worker
  const worker = await Worker.create({
    connection,
    namespace: "default",
    taskQueue: "n8n-temporal-interop",
    workflowsPath: require.resolve("./workflows"),
    activities: {
      ...aiActivities,
      ...n8nActivities,
    },
  });

  console.log("Worker created, starting...");
  console.log("Task Queue: n8n-temporal-interop");
  console.log("Activities registered:", Object.keys({
    ...aiActivities,
    ...n8nActivities,
  }).join(", "));

  // Start worker
  await worker.run();
}

run().catch((err) => {
  console.error("Worker error:", err);
  process.exit(1);
});
