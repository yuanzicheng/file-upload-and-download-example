import qs from "qs";

interface Config extends RequestInit {
    params?: object,
    data?: object
}

export const http = async (path: string, { params, data, headers, ...rest }: Config = {}) => {

    const token = sessionStorage.getItem("token") || "";
    let _headers: any = { 'token': token, 'accept-language': sessionStorage.getItem('lang') || 'en', 'Content-Type': 'application/json', ...headers };
    if (!data || data instanceof FormData) {
        _headers = { 'token': token, 'accept-language': sessionStorage.getItem('lang') || 'en', ...headers };
    }
    const config = {
        ...rest,
        method: rest.method?.toUpperCase() || "GET",
        headers: _headers
    };

    if (params) {
        path += `?${qs.stringify(params)}`;
    }

    if (data) {
        if (data instanceof FormData) {
            config.body = data;
        } else {
            config.body = JSON.stringify(data || {})
        }
    }

    const url = `/api/${path.indexOf("/") === 0 ? path.substring(1) : path}`;
    
    return window.fetch(url, config).then(
        async response => {
            if (response.ok) {
                if (response.status === 200) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") > -1) {
                        const data = await response.json();
                        return data;
                    } else {
                        const disposition = response.headers.get("content-disposition");
                        if (disposition !== null && disposition.indexOf("attachment") > -1) {
                            const blob = await response.blob();
                            const filename = disposition.split("filename=*").length > 0 ? decodeURI(disposition.split("filename=*")[1]).replace(new RegExp('"', 'g'), '') : undefined; 
                            blob_to_file(blob, filename);
                            return Promise.resolve();
                        }
                    }
                } else {
                    return response;
                }
            } else {
                return Promise.reject(response);
            }
        }
    );
};

export const get = ((...[path, config]: Parameters<typeof http>) => http(path, { ...config, method: "GET" }));
export const post = ((...[path, config]: Parameters<typeof http>) => http(path, { ...config, method: "POST" }));
export const patch = ((...[path, config]: Parameters<typeof http>) => http(path, { ...config, method: "PATCH" }));
export const put = ((...[path, config]: Parameters<typeof http>) => http(path, { ...config, method: "PUT" }));
export const del = ((...[path, config]: Parameters<typeof http>) => http(path, { ...config, method: "DELETE" }));

export const blob_to_file = (blob: Blob, filename?: string) => {
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename ? filename : "unnamed";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}
