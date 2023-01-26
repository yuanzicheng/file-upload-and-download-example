import { Upload, Alert, Button, Space, Message } from '@arco-design/web-react';
import { UploadItem } from '@arco-design/web-react/es/Upload';
import { useSafeState } from 'ahooks';
import { save_chunks, md5 } from 'utils/file';
import { useLayout } from 'pages/layout/ctx';

export const UploadPage = () => {

    const layoutCtx = useLayout();
    const [fileList, setFileList] = useSafeState<any>([]);

    const renderUploadList = (filesList: any[], props: any) => (
        <>
            {filesList.map((file, index) => {
                return (
                    <Alert
                        showIcon={false} key={index} type='success' content={file.name} closable
                        onClose={() => setFileList([])}
                    />
                );
            })}
        </>
    );

    const upload_file = () => {
        const close1 = Message.info({ content: 'Computing hash...', duration: 0 });
        md5(
            fileList[0].originFile,
            (hash: string) => {
                // TODO check if the file is exist on the server
                close1();
                const close2 = Message.info({ content: 'Caching file data...', duration: 0 });

                save_chunks(hash, fileList[0].originFile, (upload_key: string) => {
                    close2();
                    // layoutCtx.setUploadKeys(update(layoutCtx.uploadKeys, {$push: [upload_key]}));
                    layoutCtx.setShowFiles("upload");
                    setFileList([]);
                    Message.info("Uploading started...");
                });
            },
            () => {
                close1();
                Message.error("An error occurred while computing hash!");
            }
        );
    };

    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Upload
                drag autoUpload={false} limit={1} renderUploadList={renderUploadList} fileList={fileList}
                onChange={
                    (filelist: UploadItem[], file: UploadItem) => {
                        setFileList([file]);
                    }
                }
            />
            {
                fileList && fileList.length > 0
                    ?
                    <Button long type="outline" onClick={upload_file}>Upload</Button>
                    :
                    null
            }
        </Space>
    )
};