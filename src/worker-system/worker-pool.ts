import { delay } from "../common";
import { Worker } from "worker_threads";
import { WorkerState, WorkerInputMessage, WorkerOutputMessage, WorkerOutputMessageCommand } from "./worker-common";

class WorkerNode {
    constructor(
        readonly id : number,
        readonly worker : Worker,
        public state : WorkerState) { }
}

export class WorkerPool {
    public onMessageReceived?:(actionId : number, args : any) => void;
    public onWorkerBecomeIdle?:() => void;

    private readonly map : Map<number, WorkerNode>;
    private readonly maxWorkers : number;

    constructor(maxWorkers : number) {
        this.map = new Map<number, WorkerNode>();
        this.maxWorkers = maxWorkers;
    }

    hasIdle() : boolean {
        for (const kvp of this.map) {
            if(kvp[1].state == WorkerState.Idle) {
                return true;
            }
        }
        return false;
    }

    tryRunTask(actionId : number, args : any) : boolean {
        let node : WorkerNode | null = null;
        for (const kvp of this.map) {
            if(kvp[1].state == WorkerState.Idle) {
                node = kvp[1];
                break;
            }
        }

        if(!node) {
            if(this.map.size >= this.maxWorkers) {
                return false;
            }
        }

        this.runTask(node, actionId, args);
        return true;
    }

    private async runTask(node : WorkerNode | null, actionId : number, args : any) {
        if(!node) {
            node = this.createNewWorker();
            while(node.state != WorkerState.Idle) {
                await delay(10);
            }
        }

        node!.state = WorkerState.Processing;
        const msg = new WorkerInputMessage(actionId, args);
        node!.worker.postMessage(msg);
    }

    private createNewWorker() : WorkerNode {
        const workerData = "";
        const worker = new Worker("./lib/worker-system/worker.js", {workerData});

        worker.on("message", msg => {
            this.onWorkerMessage(msg);
        });
        worker.on("error", error => {
            console.error(error);
            this.disposeWorker(worker);
        });
        worker.on("exit", exitCode => { });

        const node = new WorkerNode(worker.threadId, worker, WorkerState.Initializing);
        this.map.set(worker.threadId, node);
        return node;
    }

    private disposeWorker(worker : Worker) {
        worker.terminate();
        this.map.delete(worker.threadId);
    }

    private onWorkerMessage(msg : WorkerOutputMessage) {
        const node = this.map.get(msg.senderId);

        if(msg.command == WorkerOutputMessageCommand.BecomeIdle) {
            node!.state = WorkerState.Idle;
            //console.log(`Process: ${msg.senderId} now idle`);
            if(this.onWorkerBecomeIdle){
                this.onWorkerBecomeIdle();
            }
        }

        if(msg.command == WorkerOutputMessageCommand.UserCommand) {
            if(this.onMessageReceived) {
                this.onMessageReceived(msg.actionId, msg.args);
            }
        }

        //this.disposeWorker(node!.worker);
    }
}