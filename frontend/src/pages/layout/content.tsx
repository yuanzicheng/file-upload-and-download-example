import { Layout, BackTop } from "@arco-design/web-react"
import styled from "@emotion/styled";
import { Outlet } from "react-router-dom";

export const Content = () => {
    return (
        <LayoutContent>
            <BackTop
                visibleHeight={30}
                style={{ position: 'absolute' }}
                target={() => document.getElementById('root') || window}
            />
            <Outlet />
        </LayoutContent>
    )
};

const LayoutContent = styled(Layout.Content)`
    /* margin-top: 56px; */
    padding: 10px;
    height: calc(100vh - 56px - 50px);
    overflow-y: auto;
`;