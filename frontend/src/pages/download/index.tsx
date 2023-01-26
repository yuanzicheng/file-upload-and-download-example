import { Button, Message } from "@arco-design/web-react";
import { download } from "api/file";
import { useFetch } from "context/fetch";
import { db_download } from "utils/db";
import { v4 as uuidv4 } from "uuid";
import { FileData } from "types/file";
import { useLayout } from "pages/layout/ctx";

export const Download = () => {

    const layoutCtx = useLayout();

    const file_id = "some-string";

    const { runAsync: run_download } = useFetch(download, { manual: true });

    const multipart_download = () => {
        run_download(file_id, "bytes=0-0").then(
            (res: any) => {
                const range = res.headers.get("content-range");
                const size = Number((range as string).split("/")[1]);
                const type = res.headers.get("content-type");
                const disposition = res.headers.get("content-disposition");
                const filename = disposition.split("filename").length > 0 ? decodeURI(disposition.split("filename=")[1]).replace(new RegExp('"', 'g'), '') : undefined;
                const hash = res.headers.get("x-file-hash");

                const file_data: FileData = {
                    id: file_id,
                    hash: hash,
                    name: filename || uuidv4(),
                    type: type,
                    size: size,
                    chunks: []
                };

                db_download.setItem(uuidv4(), file_data).then(
                    () => {
                        Message.info("Download started...")
                        layoutCtx.setShowFiles("download");

                    }
                ).catch(reason => { console.error(reason) });

            }
        ).catch(reason => console.error(reason));
    };

    return (
        <>
            <Button long type="outline" onClick={multipart_download}>test download</Button>
        </>
    )
};