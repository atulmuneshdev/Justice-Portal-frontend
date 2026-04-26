import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const { data } = await API.get('/auth/me');
            setUser(data);
        } catch (error) {
            setUser(null);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            checkAuth();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials, role) => {
        try {
            console.log('Attempting login with role:', role, 'and credentials:', credentials);
            const endpoint = role === 'advocate' ? '/auth/advocate/login' : '/auth/client/login';
            const { data } = await API.post(endpoint, credentials);
            console.log('Login successful, received data:', data);
            localStorage.setItem('token', data.token);
            setUser({ ...data.user, role });
        } catch (error) {
            console.error('Login error detailed:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                url: error.config?.url
            });
            const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials or connection.';
            toast.error(errorMsg);
            throw error;
        }
    };

    const register = async (credentials, role) => {
        try {
            console.log('Attempting registration with role:', role, 'and credentials:', credentials);
            const endpoint = role === 'advocate' ? '/auth/advocate/signup' : '/auth/client/signup';
            const { data } = await API.post(endpoint, credentials);
            console.log('Registration successful, received data:', data);
            localStorage.setItem('token', data.token);
            setUser({ ...data.user, role });
        } catch (error) {
            console.error('Registration error detailed:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                url: error.config?.url
            });
            const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMsg);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
