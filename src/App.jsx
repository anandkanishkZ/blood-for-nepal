import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './public/components/layout/Navbar';
import Footer from './public/components/layout/Footer';
import HomePage from './public/pages/HomePage';
import LoginPage from './public/pages/LoginPage';
import RegisterPage from './public/pages/RegisterPage';
import './App.css';

function App() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Prefer system dark mode or default to false
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode((prev) => !prev);    return (
        <div>
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/request" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blood Request Page - Coming Soon</h1></div>} />
                <Route path="/find" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Donors Page - Coming Soon</h1></div>} />
                <Route path="/education" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Education Page - Coming Soon</h1></div>} />
                <Route path="/emergency" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Emergency Blood Request - Coming Soon</h1></div>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Footer />
        </div>
    );
}

export default App;

