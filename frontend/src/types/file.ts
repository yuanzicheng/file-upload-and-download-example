export interface FileData {
    id?: string;
    hash: string;
    name: string;
    type: string;
    size: number;
    chunks: FileChunk[];  // file chunks stored in IndexedDB
};

export interface FileChunk {
    index: number;
    key: string;
    size: number;
    uploaded?: boolean;
}