import { delay } from "../common";
import { Worker } from "worker_threads";
import { WorkerState, WorkerInputMessage, WorkerOutputMessage, WorkerOutputMessageCommand } from "./worker-common";

// Путь до файла (точки входа) подпроцесса.
// Указывать с расширением .js, т.к. путь используется в рантайме.
const workerPath = "./lib/thread-system/worker-entry.js";

/**
 * Обертка для процесса.
 * Отслеживает состояние процесса и управляет потоком сообщений.
 */
export class Thread {
    public onMessageReceived?: (thread: Thread, actionId: number, args: any) => void;
    public onBecomeIdle?: (thread: Thread) => void;

    private readonly worker: Worker;
    private state: WorkerState;

    constructor() {
        this.state = WorkerState.Initializing;
        this.worker = new Worker(workerPath);
        this.worker.on("message", msg => {
            this.onWorkerMessage(msg);
        });
        this.worker.on("error", error => {
            console.error(error);
            this.dispose();
        });
        this.worker.on("exit", exitCode => {
            this.state = WorkerState.Disposed;
        });
    }

    /**
     * @returns Состояние потока.
     */
    public getState(): WorkerState {
        return this.state;
    }

    /**
     * @returns Thread Id потока.
     */
    public getId(): number {
        return this.worker.threadId;
    }

    /**
     * Ожидание инициализации потока.
     */
    public async waitForInitialize(): Promise<void> {
        while (this.state == WorkerState.Initializing) {
            await delay(10);
        }
    }

    /**
     * Запускает действие на потоке.
     * @param actionId Идентификатор действия.
     * @param args Аргументы.
     */
    public runAction(actionId: number, args: any) {
        if (this.state != WorkerState.Idle) {
            throw new Error(`Thread isn't ready to run. Current state = ${this.state}`);
        }

        this.state = WorkerState.Processing;
        const msg = new WorkerInputMessage(actionId, args);
        this.worker.postMessage(msg);
    }

    /**
     * Удаляет поток.
     */
    public dispose() {
        this.worker.terminate();
        this.state = WorkerState.Disposed;
    }

    // Вызывается при получении сообщения от процесса.
    private onWorkerMessage(msg: WorkerOutputMessage) {
        if (msg.command == WorkerOutputMessageCommand.BecomeIdle) {
            this.state = WorkerState.Idle;
            if (this.onBecomeIdle) {
                this.onBecomeIdle(this);
            }
        } else if (msg.command == WorkerOutputMessageCommand.UserCommand) {
            if (this.onMessageReceived) {
                this.onMessageReceived(this, msg.actionId, msg.args);
            }
        }
    }
}