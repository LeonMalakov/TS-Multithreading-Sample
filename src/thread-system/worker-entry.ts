import { parentPort, threadId, workerData } from "worker_threads";
import { WorkerState, WorkerInputMessage, WorkerOutputMessage, WorkerOutputMessageCommand, IWorkerContext, IWorkerAction } from "./worker-common";
import { threadActionRegistry } from "../thread-actions/thread-action-registry";

// Если мастер-порта нет,
// значит этот файл запущен неверно.
if (!parentPort) {
    throw new Error("[WorkerError] ParentPort is null");
}

/**
 * Контекст, передаваемый в действия.
 */
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

/**
 * Точка входа подпроцесса.
 * Реализует ожидание комманд от мастер-процесса.
 * А также запуск действий.
 */
class WorkerEntry {
    state: WorkerState = WorkerState.Initializing;
    context: WorkerContext;
    currentActionId: number = -1;

    // Точка входа.
    async run() {
        this.context = new WorkerContext(this);

        // Подписываемся на сообщения от мастер-процесса.
        parentPort!.on("message", msg => {
            this.onParentMessage(msg);
        });

        // Отправляем мастеру сообщение о том,
        // что поток перешел в состояние 'Свободен'.
        this.setIdleState();
    }

    // Переключает состояние в Idle.
    // И уведомляет мастер-процесса об этом.
    private setIdleState() {
        this.state = WorkerState.Idle;
        const msg = new WorkerOutputMessage(threadId, this.currentActionId, WorkerOutputMessageCommand.BecomeIdle, null);
        parentPort!.postMessage(msg);
    }

    // Выполняет действие.
    private async performAction(actionId: number, args: any) {
        // Переключаем состояние в Processing.
        this.state = WorkerState.Processing;
        this.currentActionId = actionId;

        // Выполняем действие.
        await this.runActionFromRegistry(actionId, args);

        // Переключаемся в состояние Idle.
        this.setIdleState();
    }

    // Вызывается при получении сообщения от мастер-процесса.
    private onParentMessage(msg: WorkerInputMessage) {
        // Если мы не свободны, кидаем исключение.
        if (this.state != WorkerState.Idle) {
            throw new Error(`[WorkerError] Invalid state. ThreadId = ${threadId}; Action = ${msg.actionId}`);
        }

        // Выполняем запрошенное действие.
        this.performAction(msg.actionId, msg.args);
    }

    // Запускает действие из реестра действий.
    private async runActionFromRegistry(actionId : number, args : any) : Promise<void> {
        // Достаем действие из реестра.
        const action = threadActionRegistry.get(actionId);

        if (!action) {
            throw `Action '${actionId}' not implemented.`;
        }

        // Выполняем.
        const instance: IWorkerAction = new action();
        await instance.perform(this.context, args);
    }
}

// Запускаем.
new WorkerEntry().run();