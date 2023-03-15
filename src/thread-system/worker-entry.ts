import { parentPort, threadId, workerData } from "worker_threads";
import { WorkerState, WorkerInputMessage, WorkerOutputMessage, WorkerOutputMessageCommand, IWorkerContext, IWorkerAction } from "./worker-common";
import { threadActionRegistry } from "../thread-actions/thread-action-registry";

if (!parentPort) {
    throw new Error("[WorkerError] ParentPort is null");
}

export class WorkerContext implements IWorkerContext {
    constructor(
        private readonly worker: WorkerEntry) { }

    getThreadId(): number {
        return threadId;
    }

    sendMessage(args: any) {
        const msg = new WorkerOutputMessage(threadId, this.worker.currentActionId, WorkerOutputMessageCommand.UserCommand, args);
        parentPort!.postMessage(msg);
    }
}

class WorkerEntry {
    state: WorkerState = WorkerState.Initializing;
    context: WorkerContext;
    currentActionId: number = -1;

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

    private async performAction(actionId: number, args: any) {
        this.state = WorkerState.Processing;
        this.currentActionId = actionId;
        await this.runActionFromHub(actionId, args);
        this.setIdleState();
    }

    private onParentMessage(msg: WorkerInputMessage) {
        if (this.state != WorkerState.Idle) {
            throw new Error(`[WorkerError] Invalid state. ThreadId = ${threadId}; Action = ${msg.actionId}`);
        }

        this.performAction(msg.actionId, msg.args);
    }

    private async runActionFromHub(actionId : number, args : any) : Promise<void> {
        const action = threadActionRegistry.get(actionId);

        if (!action) {
            throw `Action '${actionId}' not implemented.`;
        }

        const instance: IWorkerAction = new action();
        await instance.perform(this.context, args);
    }
}

new WorkerEntry().run();