import { parentPort, threadId, workerData } from "worker_threads";
import { WorkerState, WorkerInputMessage, WorkerOutputMessage } from "./worker-common";
import { runWorkerAction, WorkerAction } from "../worker-actions/worker-action-hub";

if(!parentPort) {
    throw "[WorkerError] ParentPort is null";
}

class WorkerMain {
    private state : WorkerState = WorkerState.Initializing;

    async run() {
        parentPort!.on("message", msg => {
            this.onParentMessage(msg);
        });

        this.setIdleState();
    }

    private setIdleState() {
        this.state = WorkerState.Idle;
        const msg = new WorkerOutputMessage(threadId, WorkerState.Idle);
        parentPort!.postMessage(msg);
    }

    private async performAction(actionId : WorkerAction, args : any) {
        this.state = WorkerState.Processing;
        await runWorkerAction(actionId, args);
        this.setIdleState();
    }

    private onParentMessage(msg : WorkerInputMessage) {
        if(this.state != WorkerState.Idle) {
            throw "[WorkerError] Invalid state";
        }

        this.performAction(msg.actionId, msg.args);       
    }
}

new WorkerMain().run();