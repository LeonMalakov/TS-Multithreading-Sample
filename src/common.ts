/**
 * Задержка.
 * @param ms 
 * @returns 
 */
export async function delay(ms : number) : Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}