import { delay } from "../common";

export async function publish(id : string) : Promise<void> {
    console.log(`Publishing.. ${id}`);
    await delay(5000);
    console.log("End Publishing..");
}