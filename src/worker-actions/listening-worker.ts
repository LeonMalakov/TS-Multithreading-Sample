export async function listening(id : number) : Promise<void> {
    console.log(`Listening.. ${id}`);

    let i = 0;
    while(i < 10000000000) {
        i++;
    }

    console.log(`End Listening.. ${id}`);
}