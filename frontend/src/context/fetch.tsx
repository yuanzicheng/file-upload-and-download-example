import { Message } from '@arco-design/web-react';
import React, { ReactNode } from "react";
import { Options, Plugin, Service } from "ahooks/lib/useRequest/src/types";
import { useRequest } from 'ahooks';


const UseFetchContext = React.createContext<
    {
        // request: (service: Service<unknown, any[]>, options?: Options<unknown, any[]> | undefined, plugins?: Plugin<unknown, any[]>[] | undefined) => Result<unknown, any[]>;
        onError: (e: Error, params: any[]) => void;
    }
    |
    null
>(null);

export const UseFetchProvider = ({ children }: { children: ReactNode }) => {

    const onError = (e: any, params: any[]) => {
        switch (e.status) {
            case 500:
                const contentType = e.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") > -1) {
                    e.json().then((data: any) => Message.error(data.msg));
                } else {
                    Message.error(e.statusText);
                }
                break;
            case 400:
                Message.error("Invalid request.");
                break;
            case 401:
                sessionStorage.removeItem("token");
                Message.error("Not logged in.");
                // window.location.reload();
                window.location.href = "/";
                break;
            case 403:
                Message.error("Unauthorized.");
                break;
            case 404:
                Message.error("Resource not found.");
                break;
            default:
                Message.error("Unknown error.");
                break;
        }
    };

    return (
        <UseFetchContext.Provider value={{ onError }}>
            {children}
        </UseFetchContext.Provider>
    );
};

export const useFetch = (service: Service<unknown, any[]>, options?: Options<unknown, any[]> | undefined, plugins?: Plugin<unknown, any[]>[] | undefined) => {

    const ctx = React.useContext(UseFetchContext);

    if (!ctx) {
        throw new Error("useFetch must be used in UseFetchProvider");
    }

    return useRequest(service, {
        ...options,
        onError: options?.onError || ctx.onError
    });
};