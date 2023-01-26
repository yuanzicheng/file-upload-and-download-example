import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LayoutPage } from "pages/layout";
import { Home } from "pages/home";
import { UploadPage } from "pages/upload";
import { Download } from "pages/download";
import { Login } from "pages/login";
import { NotFound } from "pages/not-found";
import { RequireAuth } from "context/auth";

export const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RequireAuth><LayoutPage /></RequireAuth>}>
                    <Route path="/" element={<Home />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/download" element={<Download />} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};