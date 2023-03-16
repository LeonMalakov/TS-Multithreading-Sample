import { delay } from "../common";
import { IWorkerContext, IWorkerAction } from "../thread-system/worker-common";

/**
 * Имитация обработки запроса.
 */
export class PublishingWorkerAction implements IWorkerAction {

    async perform(context: IWorkerContext, args : any): Promise<void> {
        context.sendMessage(`  [${context.getThreadId()}] Start Process: ${args}`);

        // Ненагруженное ожидание.
        await delay(10000);
        
        // Нагруженное ожидание (грузит процессор).
        // const startTime = Date.now();
        // const endTime = startTime + 10000;
        // while(Date.now() < endTime) { }

        // Отправляем произвольное сообщение мастер-процессу.
        // Это просто лог, для демонстрации.
        context.sendMessage(`  [${context.getThreadId()}] End Process ${args}`);
    }
}