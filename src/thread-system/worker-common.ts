/**
 * Состояние процесса.
 */
export enum WorkerState {
    Initializing,
    Idle,
    Processing,
    Disposed
}

/**
 * Тип выходного сообщения процесса.
 */
export enum WorkerOutputMessageCommand {
    /** Процесс освободился */
    BecomeIdle,

    /** Пользовательское сообщение */
    UserCommand
}

/**
 * Контекст процесса. Передается в действие.
 */
export interface IWorkerContext {
    /** Возвращает Thread Id процесса. */
    getThreadId() : number;

    /** Отправляет сообщение мастер-процессу. */
    sendMessage(args : any) : void;
}

/**
 * Действие процесса.
 */
export interface IWorkerAction {
    perform(context : IWorkerContext, args : any) : Promise<void>;
}

/**
 * Сообщение, отправляемое мастер-процессом подпроцессам.
 */
export class WorkerInputMessage {
    constructor(
        readonly actionId : number,
        readonly args : any) { }
}

/**
 * Сообщение, отправляемое подпроцессами мастер-процессу.
 */
export class WorkerOutputMessage {
    constructor(
        readonly senderId : number,
        readonly actionId : number,
        readonly command : WorkerOutputMessageCommand,
        readonly args : any) { }
}