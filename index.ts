import { spawn, Thread, Worker } from "threads";
import { Crawler } from "./crawler";
import { getContents, splitToChunks } from "./input";

(function main() {
    const contents = getContents("words_alpha.txt");
    const chunks = splitToChunks(contents, 50000);

    for (let i = 0; i < chunks.length; i++) {
        spawn<Crawler>(new Worker("./crawler"))
            .then(async (c) => {
                await c.start(chunks[i], i.toString());
                return await Thread.terminate(c);
            })
            .catch((reason) => {
                console.log(reason);
            })
            .finally(() => {
                console.log("finally");
            });
    }
})();
