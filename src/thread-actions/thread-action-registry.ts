import { ListeningWorkerAction } from "./listening-action";
import { PublishingWorkerAction } from "./publishing-action";

/**
 * Реестр действий.
 * Каждое действие зарегистрировано под свом идентификатором.
 * 
 * Этот список меняется юзером.
 */
export const threadActionRegistry = new Map<number, any>([
    [0, ListeningWorkerAction],
    [1, PublishingWorkerAction]
]);