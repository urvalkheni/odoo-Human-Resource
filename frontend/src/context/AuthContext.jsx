import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data.success) {
                setUser(data.data);
            }
        } catch (error) {
            console.log('User not logged in or session expired');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credential, password) => {
        // Determine if credential is email or employee_id
        const isEmail = credential.includes('@');
        const payload = isEmail 
            ? { email: credential, password }
            : { employee_id: credential, password };
        
        const { data } = await api.post('/auth/signin', payload);
        if (data.success) {
            // If the backend sends the user object in login response, use it
            // Otherwise, fetch it via /me, but usually login response includes it or a token.
            // Based on typical implementation, we might need to fetch user or use data.user
            // Let's assume data.user is returned or we fetch /me.
            // For now, let's fetch /me to be sure or use data.user if available.
            if (data.user) {
                setUser(data.user);
            } else {
                await checkUserLoggedIn();
            }
            return data;
        }
    };

    const signup = async (userData) => {
        const { data } = await api.post('/auth/signup', userData);
        if (data.success) {
            // Auto login or redirect to login? 
            // Usually valid token is set in cookie, so we can set user.
            // But verifyEmail might be required.
            if (data.token) {
                await checkUserLoggedIn();
            }
            return data;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, checkUserLoggedIn }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
