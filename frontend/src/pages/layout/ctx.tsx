import React, { ReactNode } from "react";
import { useSafeState } from "ahooks";

export const LayoutContext = React.createContext<
    {
        theme: 'dark' | 'light';
        collapsed: boolean;
        setCollapsed: (v: boolean) => void;
        showFiles: "upload" | "download" | undefined;
        setShowFiles: (v: "upload" | "download" | undefined) => void;
    }
    |
    null
>(null);

export const LayoutContextProvider = ({ children }: { children: ReactNode }) => {
    
    const [theme] = useSafeState<'dark' | 'light'>("light");    

    const [collapsed, setCollapsed] = useSafeState(false);
    const [showFiles, setShowFiles] = useSafeState<"upload" | "download" | undefined>(undefined);

    return (
        <LayoutContext.Provider
            value={
                {
                    theme,
                    collapsed,
                    setCollapsed,
                    showFiles,
                    setShowFiles,
                }
            }
        >
            {children}
        </LayoutContext.Provider>
    )
};

export const useLayout = () => {
    const context = React.useContext(LayoutContext);
    if (!context) {
        throw new Error("useLayout must be used in LayoutContextProvider");
    }
    return context;
};
