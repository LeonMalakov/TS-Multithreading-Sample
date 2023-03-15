import { ListeningWorkerAction } from "./listening-action";
import { PublishingWorkerAction } from "./publishing-action";

export const threadActionRegistry = new Map<number, any>([
    [0, ListeningWorkerAction],
    [1, PublishingWorkerAction]
]);