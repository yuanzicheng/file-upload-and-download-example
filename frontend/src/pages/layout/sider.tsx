import { Layout, Menu } from "@arco-design/web-react";
import { IconHome, IconStar } from '@arco-design/web-react/icon';
import { useLayout } from "./ctx";
import styled from "@emotion/styled";
import { useLocation, useNavigate } from "react-router-dom";
import { useSafeState } from "ahooks";


const menus = [
    {path: "/", text: "Home", icon: <IconHome />},
    {path: "/upload", text: "Upload", icon: <IconStar />},
    {path: "/download", text: "Download", icon: <IconStar />},
];


export const Sider = () => {

    
    const ctx = useLayout();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [key, setKey] = useSafeState(`/${location.pathname.split("/")[1]}`);

    return (
        <Layout.Sider
            className="full-height"
            theme={ctx.theme}
            breakpoint='lg'
            onCollapse={(collapsed) => ctx.setCollapsed(collapsed)}
            collapsed={ctx.collapsed}
            width={220}
            collapsible
        >
            <Logo className="all-center">{ctx.collapsed ? "D" : "Demo"}</Logo>
            <Menu
                // className="full-width"
                theme={ctx.theme}
                collapse={ctx.collapsed}
                selectedKeys={[key]} 
                onClickMenuItem={(key) => setKey(key)}
            >
                {
                    menus.map(
                        it => (
                            <Menu.Item key={it.path} onClick={() => navigate(it.path)}>
                                {it.icon}{it.text}
                            </Menu.Item>
                        )
                    )
                }
            </Menu>
        </Layout.Sider>
    )
};

const Logo = styled.div`
    font-size: 20px;
    padding: 10px;
    color: rgba(var(--primary-6));
`;