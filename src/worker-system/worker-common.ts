export enum WorkerState {
    Initializing,
    Idle,
    Processing
}

export class WorkerInputMessage {
    constructor(
        readonly actionId : number,
        readonly args : any) { }
}

export class WorkerOutputMessage {
    constructor(
        readonly senderId : number,
        public state : WorkerState) { }
}