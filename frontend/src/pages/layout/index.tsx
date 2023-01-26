import { Layout } from "@arco-design/web-react";
import { LayoutContextProvider } from "./ctx";
import { Sider } from "./sider";
import { Header } from "./header";
import { Content } from "./content";
import { Files } from "./files";
// import { Footer } from "./footer";


export const LayoutPage = () => {

    // const ctx = useLayout();

    return (
        <LayoutContextProvider>
            <Layout hasSider={true} style={{ height: "100vh", overflowY: "hidden" }}>
                <Sider />
                <Layout>
                    <Header />
                    <Content />
                    {/* <Footer /> */}
                </Layout>
            </Layout>
            <Files />
        </LayoutContextProvider>
    )
};