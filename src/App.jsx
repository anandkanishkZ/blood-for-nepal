import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './public/context/AuthContext';
import Navbar from './public/components/layout/Navbar';
import Footer from './public/components/layout/Footer';
import BackToTop from './public/components/common/BackToTop';
import HomePage from './public/pages/HomePage';
import LoginPage from './public/pages/LoginPage';
import RegisterPage from './public/pages/RegisterPage';
import ViewProfilePage from './public/pages/ViewProfilePage';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
    // On load, check localStorage for theme preference, default to light
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const stored = localStorage.getItem('theme');
        return stored === 'dark'; // true if 'dark', false otherwise (including null)
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

    return (
        <AuthProvider>
            <div>
                <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ViewProfilePage />} />
                <Route path="/request" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blood Request Page - Coming Soon</h1></div>} />
                <Route path="/find" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Donors Page - Coming Soon</h1></div>} />
                <Route path="/education" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Education Page - Coming Soon</h1></div>} />
                <Route path="/emergency" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Emergency Blood Request - Coming Soon</h1></div>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Footer />
            <BackToTop />
            
            {/* React Toastify Container with default professional styling */}
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={isDarkMode ? "dark" : "light"}
            />
        </div>
    </AuthProvider>
    );
}

export default App;

