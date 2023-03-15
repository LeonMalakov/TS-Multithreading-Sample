import { delay } from "../common";
import { IWorkerContext, IWorkerAction } from "../thread-system/worker-common";

export class ListeningWorkerAction implements IWorkerAction {

    async perform(context: IWorkerContext, args : any): Promise<void> {
        console.log(`[${context.getThreadId()}] Start Listening..`);

        let count = 0;
        while(true) {
            if(count < 10) {
                await delay(500);
            } else {
                await delay(20000);
            }
            
            context.sendMessage(`MSG_${count}`);
            count++;
        }
    }
}