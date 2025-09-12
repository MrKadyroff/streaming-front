import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

// Учетные данные администратора
const ADMIN_CREDENTIALS = {
    username: 'chibissovdaniil@gmail.com',
    password: 'Daniil2025!',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        // Проверяем localStorage при инициализации
        return localStorage.getItem('isAdminAuthenticated') === 'true';
    });

    const login = (username: string, password: string): boolean => {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            setIsAuthenticated(true);
            localStorage.setItem('isAdminAuthenticated', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAdminAuthenticated');
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
