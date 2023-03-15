import { WorkerState } from "./worker-common";
import { Thread } from "./thread";

export class ThreadPool {
    public onMessageReceived?: (actionId: number, args: any) => void;
    public onBecomeIdle?: () => void;

    private readonly map: Map<number, Thread>;
    private readonly maxWorkers: number;
    private idleThreadCount: number;

    constructor(maxWorkers: number) {
        this.map = new Map<number, Thread>();
        this.maxWorkers = maxWorkers;
    }

    public getIdleThreadCount(): number {
        return this.idleThreadCount;
    }

    public runAction(actionId: number, args: any) {
        const thread = this.getIdleThread();

        if (!thread) {
            throw new Error("No idle threads.");
        }

        this.runThreadAction(thread, actionId, args);
    }

    public tryRunAction(actionId: number, args: any): boolean {
        const thread = this.getIdleThread();

        if (!thread) {
            if (this.map.size >= this.maxWorkers) {
                return false;
            }
        }

        this.runThreadAction(thread, actionId, args);
        return true;
    }

    private async runThreadAction(thread: Thread | null, actionId: number, args: any) {
        if (!thread) {
            thread = await this.createNewThread();
        }
        thread.runAction(actionId, args);
    }

    private getIdleThread(): Thread | null {
        for (const kvp of this.map) {
            if (kvp[1].getState() == WorkerState.Idle) {
                this.idleThreadCount--;
                return kvp[1];
            }
        }
        return null;
    }

    private async createNewThread(): Promise<Thread> {
        const thread = new Thread();
        thread.onBecomeIdle = this.onThreadBecomeIdle.bind(this);
        thread.onMessageReceived = this.onThreadMessageReceived.bind(this);

        await thread.waitForInitialize();

        this.map.set(thread.getId(), thread);
        return thread;
    }

    private onThreadBecomeIdle(thread: Thread) {
        this.idleThreadCount++;
        if (this.onBecomeIdle) {
            this.onBecomeIdle();
        }
    }

    private onThreadMessageReceived(thread: Thread, actionId: number, args: any) {
        if (this.onMessageReceived) {
            this.onMessageReceived(actionId, args);
        }
    }
}