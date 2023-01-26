import { Grid, Layout, Button, Space } from "@arco-design/web-react";
import { IconFile, IconQuestionCircle, IconLanguage, IconMore } from '@arco-design/web-react/icon';
import styled from "@emotion/styled";
import { useLayout } from "./ctx";


export const Header = () => {

    const ctx = useLayout();

    return (
        <LayoutHeader className="ver-center">
            <Grid.Row justify="space-between" align="center" className="full-width">
                <span></span>
                <Space>
                    <Button type="text" icon={<IconFile />} onClick={() => ctx.setShowFiles("upload")} />
                    <Button type="text" icon={<IconQuestionCircle />} />
                    <Button type="text" icon={<IconLanguage />} />
                    <Button type="text" icon={<IconMore />} />
                </Space>
            </Grid.Row>
        </LayoutHeader>
    )
};

const LayoutHeader = styled(Layout.Header)`
    width: 100%;
    height: 56px;
    border-bottom: solid 1px rgba(0, 0, 0, 0.1);
    padding: 0 10px;
`;