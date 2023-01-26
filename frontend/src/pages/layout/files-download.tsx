import { List, Button, Space, Typography, Progress, Modal, Message } from "@arco-design/web-react";
import { IconDelete, IconSave } from '@arco-design/web-react/icon';
import { useMount, useSafeState, useUpdateEffect } from "ahooks";
import { useLayout } from "./ctx";
import { db_chunk, db_download } from "utils/db";
import { FileData } from "types/file";
import { blob_to_file } from "utils/http";
import { v4 as uuidv4 } from "uuid";
import { chunk_size } from "utils/file";
import { useFetch } from "context/fetch";
import { download } from "api/file";
import update from "immutability-helper";

interface DownloadData extends FileData {
    key: string;
}

export const FilesDownload = () => {

    const ctx = useLayout();

    const [loading, setLoading] = useSafeState(false);
    const [data, setData] = useSafeState<DownloadData[]>([]);

    const { runAsync: run_download } = useFetch(download, { manual: true });

    const refresh = (restart: boolean) => {
        if (restart) {
            setLoading(true);
        }
        const data: DownloadData[] = [];
        db_download.iterate(
            (value: any, key: string) => {
                const item = { key, ...value };
                data.push(item);
            }
        ).then(
            () => {
                setData(data);
                setLoading(false);
                if (restart) {
                    data.forEach(
                        it => {
                            if (it.chunks.map(item => item.size).reduce((x: number, y: number) => x + y, 0) < it.size) {
                                download_chunks(it, it.chunks.length);
                            }
                        }
                    );
                }
            }
        ).catch(
            () => {
                setData([]);
                setLoading(false);
            }
        );
    };

    const download_chunks = (file_data: DownloadData, index: number) => {

        const total_chunks = Math.ceil(file_data.size / chunk_size);

        const download_chunk = (current_chunk: number = 0, file_data: DownloadData, batch: number = 1000) => {
            const start = chunk_size * current_chunk;
            const end = ((start + chunk_size) >= file_data.size) ? (file_data.size - 1) : (start + chunk_size - 1);
            const range = `bytes=${start}-${end}`;
            console.log("download chunk:" + (current_chunk + 1), range);
            run_download(file_data.id, range).then(
                (res: any) => {
                    const chunk_key = uuidv4();
                    db_chunk.setItem(chunk_key, res.blob()).then(
                        () => {
                            const chunk = { index: current_chunk, key: chunk_key, size: Number(res.headers.get("content-length")) };
                            const updated_file_data = update(file_data, { chunks: { $push: [chunk] } });
                            db_download.setItem(file_data.key, updated_file_data).then(
                                () => {
                                    refresh(false);
                                    batch--;
                                    if (current_chunk < total_chunks - 1) {
                                        if (batch > 0) {
                                            download_chunk(current_chunk + 1, updated_file_data, batch);
                                        } else {
                                            setTimeout(() => download_chunk(current_chunk + 1, updated_file_data, 1000), 0);
                                        }
                                    }
                                }
                            ).catch(reason => console.error(reason));
                        }
                    ).catch(reason => console.error(reason));
                }
            ).catch(reason => { console.error(reason) });
        };

        download_chunk(index, file_data, 1000);
    };

    const save = (v: DownloadData) => {
        if (v.chunks.map(item => item.size).reduce((x: number, y: number) => x + y, 0) !== v.size) {
            Message.error("The download is not completed.");
        } else {
            const data: Blob[] = [];
            for (let i = 0; i < v.chunks.length; i++) {
                const chunk_key = v.chunks.find(chunk => chunk.index === i)?.key;
                if (chunk_key) {
                    db_chunk.getItem(chunk_key).then(
                        (value: any) => {
                            data.push(value);
                            if (i === v.chunks.length - 1) {
                                const blob = new Blob([...data]);
                                blob_to_file(blob, v.name);
                            }
                        }
                    ).catch(reason => console.error(reason));
                }
            }
        }
    };

    const delete_download_file = (v: DownloadData) => {
        Modal.confirm(
            {
                title: "Confirm",
                content: "Are you sure to delete this download record?",
                onOk: () => {
                    db_download.removeItem(v.key).then(
                        () => {
                            refresh(false);
                            v.chunks.forEach(
                                chunk => {
                                    db_chunk.removeItem(chunk.key).then(() => console.log(`deleted ${v.name} chunk ${chunk.index + 1} of ${v.chunks.length}`));
                                }
                            )
                        }
                    ).catch(reason => { });
                }
            }
        );
    };

    useUpdateEffect(
        () => {
            if (ctx.showFiles === undefined) {
                setLoading(false);
                setData([]);
            } else {
                refresh(true);
            }
        },
        [ctx.showFiles]
    );

    useMount(() => {
        console.log("on mount, download");
        // refresh(true);
    });

    return (
        <>
            <List
                size='small'
                loading={loading}
                dataSource={data}
                render={
                    (it: DownloadData, index) => (
                        <List.Item
                            key={index}
                            extra={
                                <div style={{ height: "100%" }} className="mar-lft-10 ver-center">
                                    <Space>
                                        <Progress
                                            size="small" type='circle'
                                            percent={
                                                Math.floor((it.chunks.map(item => item.size).reduce((x: number, y: number) => x + y, 0) / it.size) * 100 * 10) / 10
                                            }
                                        />
                                        <Button
                                            shape='circle' icon={<IconSave />} onClick={() => save(it)}
                                            disabled={it.chunks.map(item => item.size).reduce((x: number, y: number) => x + y, 0) !== it.size}
                                            />
                                        <Button 
                                            shape='circle' icon={<IconDelete />} onClick={() => delete_download_file(it)} 
                                            disabled={it.chunks.map(item => item.size).reduce((x: number, y: number) => x + y, 0) !== it.size}
                                        />
                                    </Space>
                                </div>}>
                            <List.Item.Meta title={<Typography.Paragraph>{it.name}</Typography.Paragraph>} description={`md5:${it.hash}`} />
                        </List.Item>
                    )
                }
            />
        </>
    );
};