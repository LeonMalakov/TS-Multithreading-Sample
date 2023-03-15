import { delay } from "../common";
import { IWorkerContext, IWorkerAction } from "../thread-system/worker-common";

export class PublishingWorkerAction implements IWorkerAction {

    async perform(context: IWorkerContext, args : any): Promise<void> {
        context.sendMessage(`  [${context.getThreadId()}] Start Process: ${args}`);

        await delay(10000);
        
        // Нагруженное ожидание.
        // const startTime = Date.now();
        // const endTime = startTime + 10000;
        // while(Date.now() < endTime) { }

        context.sendMessage(`  [${context.getThreadId()}] End Process ${args}`);
    }
}