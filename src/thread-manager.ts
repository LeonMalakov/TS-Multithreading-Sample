import { Worker } from "worker_threads";

export class ThreadManager {
    run() {
        const workerData = "wdata";
        const worker = new Worker("./lib/worker.js", { workerData });

        worker.on("message", msg => {
            console.log(`Msg: ${msg}`);
        });

        worker.on("error", error => {
            console.log(`Error: ${error}`);
            worker.terminate();
        });

        worker.on("exit", code => {
            console.log(`Exit with code: ${code}`);
        });
    }
}