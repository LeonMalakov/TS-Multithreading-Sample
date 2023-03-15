import { MessagePort } from "worker_threads";

export enum WorkerState {
    Initializing,
    Idle,
    Processing
}

export enum WorkerOutputMessageCommand {
    BecomeIdle,
    UserCommand
}

export interface IWorkerContext {
    getThreadId() : number;
    sendMessage(args : any) : void;
}

export class WorkerInputMessage {
    constructor(
        readonly actionId : number,
        readonly args : any) { }
}

export class WorkerOutputMessage {
    constructor(
        readonly senderId : number,
        readonly actionId : number,
        readonly command : WorkerOutputMessageCommand,
        readonly args : any) { }
}