import { get, post } from "utils/http";

export const upload = (data: FormData) => post("/upload", { data });

export const download = (id: string, range: string = "bytes=0-0") => get(`/download/${id}`, {headers: {"Range": range}});
