import { Queue } from "queue-typescript";
import { Thread } from "./thread-system/thread";
import { ThreadPool } from "./thread-system/thread-pool";

export class ThreadManager {
    private listenThread : Thread;
    private requestsQueue : Queue<any>;
    private threadPool : ThreadPool;

    async run() {    
        this.requestsQueue = new Queue<any>();

        this.threadPool = new ThreadPool(4);
        this.threadPool.onBecomeIdle = this.onProcessThreadBecomeIdle.bind(this);
        this.threadPool.onMessageReceived = (actionId, msg) => console.info(`    PoolThread message: ${msg}`);

        this.listenThread = new Thread();
        this.listenThread.onMessageReceived = this.onRequestReceived.bind(this);
        await this.listenThread.waitForInitialize();
        this.listenThread.runAction(0, null);
    }

    private onRequestReceived(thread : Thread, actionId : number, args : any) {
        if(actionId != 0) {
            throw new Error("Invalid listen thread message.");
        }

        console.info(`\nReceived: ${args}`);

        if(!this.threadPool.tryRunAction(1, args)) {
            this.requestsQueue.enqueue(args);
        }
    }

    private onProcessThreadBecomeIdle() {
        if(this.requestsQueue.length > 0) {
            const msg = this.requestsQueue.dequeue();
            this.threadPool.runAction(1, msg);
        }
    }
}