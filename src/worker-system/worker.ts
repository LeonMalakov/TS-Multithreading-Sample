import { parentPort, threadId, workerData } from "worker_threads";
import { WorkerState, WorkerInputMessage, WorkerOutputMessage, WorkerOutputMessageCommand, IWorkerContext } from "./worker-common";
import { runWorkerAction } from "../worker-actions/worker-action-hub";

if(!parentPort) {
    throw new Error ("[WorkerError] ParentPort is null");
}

export class WorkerContext implements IWorkerContext {
    constructor(
        private readonly worker : WorkerMain) { }

    getThreadId(): number {
        return threadId;
    }
    
    sendMessage(args : any) {
        const msg = new WorkerOutputMessage(threadId, this.worker.currentActionId, WorkerOutputMessageCommand.UserCommand, args);
        parentPort!.postMessage(msg);
    }
}

class WorkerMain {
    state : WorkerState = WorkerState.Initializing;
    context : WorkerContext;
    currentActionId : number = -1;

    async run() {
        this.context = new WorkerContext(this);

        parentPort!.on("message", msg => {
            this.onParentMessage(msg);
        });

        this.setIdleState();
    }

    private setIdleState() {
        this.state = WorkerState.Idle;
        const msg = new WorkerOutputMessage(threadId, this.currentActionId, WorkerOutputMessageCommand.BecomeIdle, null);
        parentPort!.postMessage(msg);
    }

    private async performAction(actionId : number, args : any) {
        this.state = WorkerState.Processing;
        this.currentActionId = actionId;
        await runWorkerAction(actionId, this.context, args);
        this.setIdleState();
    }

    private onParentMessage(msg : WorkerInputMessage) {
        if(this.state != WorkerState.Idle) {
            throw new Error (`[WorkerError] Invalid state. ThreadId = ${threadId}; Action = ${msg.actionId}`);
        }

        this.performAction(msg.actionId, msg.args);       
    }
}

new WorkerMain().run();