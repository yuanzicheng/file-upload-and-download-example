import { useSafeState } from "ahooks";
import React, { ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { User } from "types/user";

export const AuthContext = React.createContext<
    {
        user: User | null;
        setUser: (user: User | null) => void;
    }
    |
    null
>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

    const [user, setUser] = useSafeState<User | null>(null);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used in AuthProvider");
    }
    return context;
};

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
    let location = useLocation();

    if (!sessionStorage.getItem("token")) {
        return <Navigate to="/login" state={{ from: location.pathname }} />;
    }
    return children;
};