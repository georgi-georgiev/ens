import { readFileSync } from "fs";

export function getContents(filename: string): string[] {
    let contents = readFileSync(filename, "utf-8");
    let arr = contents.split(/\r?\n/);
    return arr;
}

export function splitToChunks(array: string[], size: number): string[][] {
    let resultArray: string[][] = [];
    let chunkSize = array.length / size;
    for (let i = 0; i < chunkSize; i++) {
        resultArray.push(array.splice(0, size));
    }
    return resultArray;
}
