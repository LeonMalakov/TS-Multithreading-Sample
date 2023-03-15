import { IWorkerContext } from "../worker-system/worker-common";
import { IWorkerAction } from "../worker-system/i-worker-action";
import { ListeningWorkerAction } from "./listening-action";
import { PublishingWorkerAction } from "./publishing-action";

const actionMap = new Map<number, any>([
    [0, ListeningWorkerAction],
    [1, PublishingWorkerAction]
]);

export async function runWorkerAction(actionId : number, context : IWorkerContext, args : any) : Promise<void> {
    const action = actionMap.get(actionId);

    if(!action) {
        throw `Action '${actionId}' not implemented.`;
    }

    //await action(args);
    const instance : IWorkerAction = new action();
    await instance.perform(context, args);
}