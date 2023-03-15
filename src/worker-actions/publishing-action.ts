import { delay } from "../common";
import { IWorkerAction } from "../worker-system/i-worker-action";
import { IWorkerContext } from "../worker-system/worker-common";

export class PublishingWorkerAction implements IWorkerAction {

    async perform(context: IWorkerContext, args : any): Promise<void> {
        context.sendMessage(`  [${context.getThreadId()}] Start Process: ${args}`);

        // let i = 0;
        // while(i < 10000000000) {
        //     i++;
        // }
        await delay(10000);

        context.sendMessage(`  [${context.getThreadId()}] End Process ${args}`);
    }
}