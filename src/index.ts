import { ThreadManager } from "./thread-manager";

// Точкой входа главного процесса является index.
// ThreadManager - это функционал главного процесса.
const threadManager = new ThreadManager();
threadManager.run();