import { listening } from "./listening-worker"
import { publish } from "./publish-worker";

export enum WorkerAction {
    Listening,
    Publish
}

const actionMap = new Map<WorkerAction, any>([
    [WorkerAction.Listening, listening],
    [WorkerAction.Publish, publish]
]);

export async function runWorkerAction(actionId : WorkerAction, args : any) : Promise<void> {
    const action = actionMap.get(actionId);

    if(!action) {
        throw `Action '${actionId}' not implemented.`;
    }

    await action(args);
}