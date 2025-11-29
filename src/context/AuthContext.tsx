import React, { createContext, useState, useContext, ReactNode } from 'react';
import { getUserByUsername, addUser, updateUser } from '../database/database';

interface AuthContextProps {
    user: string | null;
    userId: number | null;
    isAdmin: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; isAdmin: boolean }>;
    register: (username: string, password: string, phone: string) => Promise<boolean>;
    updateProfile: (data: { password?: string; phone?: string }) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    const login = async (username: string, password: string): Promise<{ success: boolean; isAdmin: boolean }> => {
        try {
            const dbUser = await getUserByUsername(username);
            if (dbUser && dbUser.password === password) {
                setUser(username);
                setUserId(dbUser.id);
                setIsAdmin(dbUser.isAdmin);
                return { success: true, isAdmin: dbUser.isAdmin };
            }
            return { success: false, isAdmin: false };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, isAdmin: false };
        }
    };

    const register = async (username: string, password: string, phone: string): Promise<boolean> => {
        try {
            const newUserId = await addUser({ username, password, isAdmin: false, phone });
            setUser(username);
            setUserId(newUserId);
            setIsAdmin(false);
            return true;
        } catch (error) {
            console.error('Register error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setUserId(null);
        setIsAdmin(false);
    };

    const updateProfile = async (data: { password?: string; phone?: string }): Promise<boolean> => {
        try {
            if (!userId) throw new Error('No user id');
            await updateUser(userId, { password: data.password, phone: data.phone });
            return true;
        } catch (error) {
            console.error('Update profile error:', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, userId, isAdmin, login, register, updateProfile, logout }}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
