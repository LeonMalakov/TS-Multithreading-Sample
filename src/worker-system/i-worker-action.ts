import { IWorkerContext } from "./worker-common";

export interface IWorkerAction {
    perform(context : IWorkerContext, args : any) : Promise<void>;
}