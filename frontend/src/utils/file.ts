import update from "immutability-helper";
import { v4 as uuidv4 } from 'uuid';
import SparkMD5 from "spark-md5";
import { db_upload, db_chunk } from "./db";
import { FileData } from "types/file";

export const chunk_size = 1024 * 1024;

export const download_chunks = (id: string) => {

};

export const save_chunks = (hash: string, file: File, callback: Function) => {

    const blob = file; //new Blob([file], { type: file.type });
    const chunks = Math.ceil(blob.size / chunk_size);

    const upload_key = uuidv4();
    const file_data: FileData = {
        hash: hash,
        name: file.name,
        type: file.type,
        size: file.size,
        chunks: []
    };

    const save_chunk = (current_chunk: number, file_data: object, batch: number) => {
        const start = chunk_size * current_chunk;
        const end = ((start + chunk_size) >= blob.size) ? blob.size : (start + chunk_size);
        console.log(start, end);
        const file_chunk = blob.slice(start, end, blob.type);
        const key = uuidv4();
        db_chunk.setItem(key, file_chunk, () => {
            file_data = update(file_data, { chunks: { $push: [{ key, index: current_chunk, size: end - start, uploaded: false }] } });
            db_upload.setItem(upload_key, file_data, () => {
                batch--;
                if (current_chunk < chunks - 1) {
                    if (batch > 0) {
                        save_chunk(current_chunk + 1, file_data, batch);
                    } else {
                        setTimeout(() => save_chunk(current_chunk + 1, file_data, 1000), 0);
                    }
                } else {
                    callback(upload_key);
                }
            });
        });
    };

    save_chunk(0, file_data, 1000);
};

export const md5 = (file: File, ok: Function, err: Function) => {
    var blobSlice = File.prototype.slice,
        chunkSize = 1024 * 1024 * 10,                             // Read in chunks of 10mb
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        spark = new SparkMD5.ArrayBuffer(),
        fileReader = new FileReader();

    fileReader.onload = function (e: any) {
        console.log('read chunk nr', currentChunk + 1, 'of', chunks);
        spark.append(e.target.result);                   // Append array buffer
        currentChunk++;

        if (currentChunk < chunks) {
            loadNext();
        } else {
            const md5 = spark.end();
            console.log('finished loading');
            console.info('computed hash', md5);  // Compute hash
            ok(md5);
        }
    };

    fileReader.onerror = function () {
        console.warn('oops, something went wrong.');
        err();
    };

    function loadNext() {
        var start = currentChunk * chunkSize,
            end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    loadNext();
};

