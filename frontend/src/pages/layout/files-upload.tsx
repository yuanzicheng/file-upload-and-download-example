import { List, Button, Space, Typography, Progress, Modal } from "@arco-design/web-react";
import { IconDelete } from '@arco-design/web-react/icon';
import { useMount, useSafeState, useUpdateEffect } from "ahooks";
import { useLayout } from "./ctx";
import { db_chunk, db_upload } from "utils/db";
import { FileChunk, FileData } from "types/file";
import { useFetch } from "context/fetch";
import { upload, } from "api/file";
import update from "immutability-helper";

interface UploadData extends FileData {
    key: string;
}

export const FilesUpload = () => {

    const ctx = useLayout();

    // const { runAsync: run_init_upload } = useFetch(init_upload, { manual: true });
    const { runAsync: run_upload } = useFetch(upload, { manual: true });

    const [loading, setLoading] = useSafeState(false);
    const [data, setData] = useSafeState<UploadData[]>([]);

    const refresh = (restart: boolean) => {
        if (restart) {
            setLoading(true);
        }
        const data: UploadData[] = [];
        db_upload.iterate(
            (value: any, key: string) => {
                const item = { key, ...value };
                data.push(item);
            }
        ).then(
            () => {
                setData(data);
                setLoading(false);
                if (restart) {
                    data.filter(it => it.chunks.findIndex(chunk => chunk.uploaded === false) > -1).forEach(
                        it => {
                            upload_chunks(it);
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

    const upload_chunks = (v: UploadData) => {
        const upload_chunk = (chunk: FileChunk, batch: number) => {
            db_chunk.getItem(chunk.key).then(
                (value) => {
                    console.log("upload", v.hash, "---", chunk.index, "of", v.chunks.length);
                    const form_data = new FormData();
                    form_data.append('index', chunk.index.toString());
                    form_data.append('total', v.chunks.length.toString());
                    form_data.append('name', v.name);
                    form_data.append('type', v.type);
                    form_data.append('size', v.size.toString());
                    form_data.append('hash', v.hash);
                    form_data.append('file', value as Blob);
                    run_upload(form_data).then(
                        (res: any) => {
                            // 上传成功后，将uploaded更新为true
                            db_upload.getItem(v.key).then(
                                value => {
                                    const data = (value as FileData);
                                    const index = data.chunks.findIndex(it => it.key === chunk.key);
                                    if (index > -1) {
                                        const new_data = update(data, { chunks: { [index]: { uploaded: { $set: true } } } });
                                        db_upload.setItem(v.key, new_data).then(
                                            value => {
                                                refresh(false);
                                                batch--;
                                                const chunks = new_data.chunks.filter(it => it.uploaded === false);
                                                if (chunks.length > 0) {
                                                    if (batch > 0) {
                                                        upload_chunk(chunks[0], batch);
                                                    } else {
                                                        setTimeout(() => upload_chunk(chunks[0], 1000), 0);
                                                    }
                                                }
                                            }
                                        ).catch(reason => { console.error(reason) });
                                    }
                                }
                            ).catch(reason => { console.error(reason) });
                        }
                    ).catch(reason => { console.error(reason) });
                }
            ).catch(reason => { console.error(reason) });
        }

        const chunks = v.chunks.filter(it => it.uploaded === false);
        if (chunks.length > 0) {
            upload_chunk(chunks[0], 1000);
        }
    };

    const delete_upload_file = (v: UploadData) => {
        Modal.confirm(
            {
                title: "Confirm",
                content: "Are you sure to delete this upload record?",
                onOk: () => {
                    db_upload.removeItem(v.key).then(
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

    useMount(
        () => {
            console.log("on mount, upload");
            refresh(true);
        }
    );

    return (
        <>
            <List
                size='small'
                loading={loading}
                dataSource={data}
                render={
                    (it: UploadData, index) => (
                        <List.Item
                            key={index}
                            extra={
                                <div style={{ height: "100%" }} className="mar-lft-10 ver-center">
                                    <Space>
                                        <Progress
                                            size="small" type='circle'
                                            percent={
                                                Math.floor((it.chunks.filter((item) => item.uploaded).map(item => item.size).reduce((x: number, y: number) => x + y, 0) / it.size) * 100 * 10) / 10
                                            }
                                        />
                                        <Button 
                                            shape='circle' icon={<IconDelete />} onClick={() => delete_upload_file(it)}
                                            disabled={it.chunks.filter((item) => item.uploaded).map(item => item.size).reduce((x: number, y: number) => x + y, 0) !== it.size}
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