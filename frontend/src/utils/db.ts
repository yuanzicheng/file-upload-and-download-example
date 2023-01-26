import localforage from "localforage";

export const db_upload = localforage.createInstance({ name: "myapp", storeName: "upload" });
export const db_download = localforage.createInstance({ name: "myapp", storeName: "download" });
export const db_chunk = localforage.createInstance({ name: "myapp", storeName: "chunk" });