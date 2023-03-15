import { ThreadPool } from "./worker-system/thread-pool";
import { delay } from "./common";
import { Queue } from "queue-typescript";
import { ThreadManager } from "./thread-manager";

const threadManager = new ThreadManager();
threadManager.run();

// const handlerMap = new Map<number, any>([
//     [0, onNewRequestReceived],
//     [1, (msg : any) => console.info(msg)]
// ]);

// let requestsQueue : Queue<any>;
// let workerPool: ThreadPool;


// function tryRunProcessRequest(args: any) : boolean {
//     return workerPool.tryRunAction(1, args);
// }

// function onWorkerBecomeIdle() {
//      if(requestsQueue.length > 0) {
//         const item = requestsQueue.dequeue();
//         tryRunProcessRequest(item);
//     }
// }

// function onMessageReceived(actionId: number, args: any) {
//     const handler = handlerMap.get(actionId);
//     if (!handler) {
//         return;
//     }
//     handler(args);
// }

// function onNewRequestReceived(args: any) {
//     console.log(`\nRequest Received: ${args}`);

//     if (!tryRunProcessRequest(args)) {
//         requestsQueue.enqueue(args);
//     }
// }

// function run() {
//     requestsQueue = new Queue<any>();
//     workerPool = new ThreadPool(4);
//     workerPool.onMessageReceived = onMessageReceived;
//     workerPool.onBecomeIdle = onWorkerBecomeIdle;

//     workerPool.tryRunAction(0, null);
//     //workerPool.runTask(WorkerAction.Publish, "qwer");
//     //await delay(7000);
//     //await delay(1000);
//     //workerPool.runTask(WorkerAction.Listening, 6);
// }

// run();