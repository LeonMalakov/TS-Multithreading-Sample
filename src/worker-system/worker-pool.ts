import { Worker } from "worker_threads";
import { WorkerAction } from "../worker-actions/worker-action-hub";
import { WorkerState, WorkerInputMessage, WorkerOutputMessage } from "./worker-common";

class WorkerNode {
    constructor(
        readonly worker : Worker,
        public state : WorkerState) { }
}

export class WorkerPool {
    private readonly map : Map<number, WorkerNode>;

    constructor() {
        this.map = new Map<number, WorkerNode>();
    }

    async runTask(actionId : WorkerAction, args : any) {
        let founded : boolean = false;
        let id : number = 0;
        for (const kvp of this.map) {
            if(kvp[1].state == WorkerState.Idle) {
                id = kvp[0];
                founded = true;
                break;
            }
        }

        if(!founded) {
            id = this.createNewWorker();
            // await idle
        }

        const node = this.map.get(id);
        const msg = new WorkerInputMessage(actionId, args);
        node!.worker.postMessage(msg);
        node!.state = WorkerState.Processing;
    }

    private createNewWorker() : number {
        const workerData = "";
        const worker = new Worker("./lib/workers/worker.js", {workerData});

        worker.on("message", msg => {
            this.onWorkerMessage(msg);
        });
        worker.on("error", error => {
            console.error(error);
            this.disposeWorker(worker);
        });
        worker.on("exit", exitCode => { });

        this.map.set(worker.threadId, new WorkerNode(worker, WorkerState.Initializing));
        return worker.threadId;
    }

    private disposeWorker(worker : Worker) {
        worker.terminate();
        this.map.delete(worker.threadId);
    }

    private onWorkerMessage(msg : WorkerOutputMessage) {
        const node = this.map.get(msg.senderId);
        node!.state = msg.state;
        console.log(`Process: ${msg.senderId} state: ${msg.state}`);
        //this.disposeWorker(node!.worker);
    }
}