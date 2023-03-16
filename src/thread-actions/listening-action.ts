import { delay } from "../common";
import { IWorkerContext, IWorkerAction } from "../thread-system/worker-common";

/**
 * Имитация потока прослушки.
 */
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
            
            // Отправляем сообщение мастер-процессу.
            // В качестве аргумента можно класть любой plain-объект.
            // (Т.е. нельзя рантайм ссылки класть)
            context.sendMessage(`MSG_${count}`);

            count++;
        }
    }
}