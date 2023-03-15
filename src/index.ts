import { WorkerAction } from "./worker-actions/worker-action-hub";
import { WorkerPool } from "./workers/worker-pool";
import { delay } from "./common";

async function main() {
    const workerPool = new WorkerPool();

    workerPool.runTask(WorkerAction.Publish, "qwer");
    await delay(7000);
    workerPool.runTask(WorkerAction.Listening, 5);
    await delay(1000);
    workerPool.runTask(WorkerAction.Listening, 6);
}

main();