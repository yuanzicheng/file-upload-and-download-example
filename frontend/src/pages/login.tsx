import React from "react";
import { Button } from "@arco-design/web-react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { useAuth } from "context/auth";

export const Login = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();

    return (
        <React.Fragment>
            <LoginPage>
                <Button
                    onClick={
                        () => {
                            sessionStorage.setItem("token", "1");
                            auth.setUser({email: "a@b.cc", name: ""});
                            let { from }: any = location.state || { from: "/" };
                            navigate(from);
                        }
                    }
                >
                    Login
                </Button>
            </LoginPage>
        </React.Fragment>
    );
};

const LoginPage = styled.div`
    width: "100%";
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
`;