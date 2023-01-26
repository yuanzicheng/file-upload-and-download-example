import { Drawer, Tabs } from "@arco-design/web-react";
import { useMount, useSafeState, useUpdateEffect } from "ahooks";
import { useLayout } from "./ctx";
import { FilesUpload } from "./files-upload";
import { FilesDownload } from "./files-download";

export const Files = () => {

    const ctx = useLayout();

    const [activeTab, setActiveTab] = useSafeState("upload");

    useUpdateEffect(
        () => {
            if (!!ctx.showFiles) {
                setActiveTab(ctx.showFiles);
            }
        },
        [ctx.showFiles]
    );

    useMount(() => console.log("on mount, files"));

    return (
        <Drawer
            width={520}
            mountOnEnter={false}
            title={<span>Files Transferring</span>}
            visible={!!ctx.showFiles}
            onCancel={() => { ctx.setShowFiles(undefined) }}
            footer={null}
        >
            <Tabs lazyload={false} activeTab={activeTab} onChange={setActiveTab}>
                <Tabs.TabPane key='upload' title='Upload'>
                    <FilesUpload />
                </Tabs.TabPane>
                <Tabs.TabPane key='download' title='Download'>
                    <FilesDownload />
                </Tabs.TabPane>
            </Tabs>
        </Drawer>
    )
}