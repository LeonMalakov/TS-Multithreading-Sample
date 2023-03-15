export enum WorkerState {
    Initializing,
    Idle,
    Processing,
    Disposed
}

export enum WorkerOutputMessageCommand {
    BecomeIdle,
    UserCommand
}

export interface IWorkerContext {
    getThreadId() : number;
    sendMessage(args : any) : void;
}

export interface IWorkerAction {
    perform(context : IWorkerContext, args : any) : Promise<void>;
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