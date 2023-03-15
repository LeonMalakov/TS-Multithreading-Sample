import { parentPort, workerData } from "worker_threads";

console.log(`Worker here: ${workerData}`);

parentPort?.postMessage("abc");