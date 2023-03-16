import { Queue } from "queue-typescript";
import { Thread } from "./thread-system/thread";
import { ThreadPool } from "./thread-system/thread-pool";

/**
 * Менеджер потоков.
 * Выступает промежуточным звеном между процессами.
 * Запускает поток прослушки и получает из него запросы.
 * Раздает полученные запросы потокам обработки из пула.
 */
export class ThreadManager {
    private listenThread : Thread;
    private requestsQueue : Queue<any>;
    private threadPool : ThreadPool;

    // Точка входа.
    async run() {    
        this.requestsQueue = new Queue<any>();

        // Создаем пул.
        this.threadPool = new ThreadPool(4);
        // При освобождении потока из пула, вызываем метод.
        this.threadPool.onBecomeIdle = this.onProcessThreadBecomeIdle.bind(this);
        // При получении сообщения от потока из пула, выводим его в консоль.
        this.threadPool.onMessageReceived = (actionId, msg) => console.info(`    PoolThread message: ${msg}`);

        // Создаем поток для прослушки и ждем когда он будет запущен.
        this.listenThread = new Thread();
        this.listenThread.onMessageReceived = this.onRequestReceived.bind(this);
        await this.listenThread.waitForInitialize();

        // Запускаем прослушку.
        // 0 - код запускаемого действия.
        // null - аргументы.
        this.listenThread.runAction(0, null);
    }

    // Вызывается при получении запроса потоком прослушки.
    private onRequestReceived(thread : Thread, actionId : number, args : any) {
        if(actionId != 0) {
            throw new Error("Invalid listen thread message.");
        }

        console.info(`\nReceived: ${args}`);

        // Пытаемся запустить обработку на потоке из пула.
        // Если не получилось (все заняты и достигнут лимит численности),
        // кладем в очередь.
        if(!this.threadPool.tryRunAction(1, args)) {
            this.requestsQueue.enqueue(args);
        }
    }

    // Вызывается когда поток из пула освобождается.
    private onProcessThreadBecomeIdle() {
        // Если очередь не пуста,
        // запускаем поток обработки, отдав ему запрос.
        if(this.requestsQueue.length > 0) {
            const msg = this.requestsQueue.dequeue();
            this.threadPool.runAction(1, msg);
        }
    }
}