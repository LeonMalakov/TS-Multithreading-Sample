import { WorkerState } from "./worker-common";
import { Thread } from "./thread";

/**
 * Пул потоков.
 * Создает и управляет потоками.
 * Можно запускать действие на потоках из пула.
 */
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

    /**
     * @returns кол-во свободных потоков.
     */
    public getIdleThreadCount(): number {
        return this.idleThreadCount;
    }

    /**
     * Запускает действие на потоке из пула.
     * Если нет свободных потоков и достигнут лимит численности - бросает исключение.
     * @param actionId идентификатор действия.
     * @param args аргументы.
     */
    public runAction(actionId: number, args: any) {
        const thread = this.getIdleThread();

        if (!thread) {
            throw new Error("No idle threads.");
        }

        this.runThreadAction(thread, actionId, args);
    }

    /**
     * Пытается запустить действие на потоке из пула.
     * Если нет свободных потоков и достигнут лимит численности - возвращает False.
     * @param actionId идентификатор действия.
     * @param args аргументы.
     */
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

    // Запускает действие.
    private async runThreadAction(thread: Thread | null, actionId: number, args: any) {
        if (!thread) {
            thread = await this.createNewThread();
        }
        thread.runAction(actionId, args);
    }

    // Возвращает свободный поток.
    private getIdleThread(): Thread | null {
        for (const kvp of this.map) {
            if (kvp[1].getState() == WorkerState.Idle) {
                this.idleThreadCount--;
                return kvp[1];
            }
        }
        return null;
    }

    // Создает новый поток.
    private async createNewThread(): Promise<Thread> {
        const thread = new Thread();
        thread.onBecomeIdle = this.onThreadBecomeIdle.bind(this);
        thread.onMessageReceived = this.onThreadMessageReceived.bind(this);

        await thread.waitForInitialize();

        this.map.set(thread.getId(), thread);
        return thread;
    }

    // Вызывается, когда поток освобождается.
    private onThreadBecomeIdle(thread: Thread) {
        this.idleThreadCount++;
        if (this.onBecomeIdle) {
            this.onBecomeIdle();
        }
    }

    // Вызывается, когда поток присылает сообщение.
    private onThreadMessageReceived(thread: Thread, actionId: number, args: any) {
        if (this.onMessageReceived) {
            this.onMessageReceived(actionId, args);
        }
    }
}