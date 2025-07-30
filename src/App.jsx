import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './public/context/AuthContext';
import Navbar from './public/components/layout/Navbar';
import Footer from './public/components/layout/Footer';
import BackToTop from './public/components/common/BackToTop';
import ScrollToTop from './public/components/common/ScrollToTop';
import HomePage from './public/pages/HomePage';
import FindDonorPage from './public/pages/FindDonorPage';
import LoginPage from './public/pages/LoginPage';
import RegisterPage from './public/pages/RegisterPage';
import NewRegisterPage from './public/pages/NewRegisterPage';
import VerificationMethodSelectionPage from './public/pages/VerificationMethodSelectionPage';
import SmsVerificationNeededPage from './public/pages/SmsVerificationNeededPage';
import VerificationPage from './public/pages/VerificationPage';
import EmailVerificationPage from './public/pages/EmailVerificationPage';
import EmailVerificationNeededPage from './public/pages/EmailVerificationNeededPage';
import ForgotPasswordPage from './public/pages/ForgotPasswordPage';
import ResetPasswordPage from './public/pages/ResetPasswordPage';
import DashboardPage from './public/pages/DashboardPage';
import DonorRegistrationPage from './public/pages/DonorRegistrationPage';
import RequestBloodPage from './public/pages/RequestBloodPage';
import EducationPage from './public/pages/EducationPage';
import EmergencyPage from './public/pages/EmergencyPage';
import AboutPage from './public/pages/AboutPage';
import PrivacyPolicyPage from './public/pages/PrivacyPolicyPage';
import TermsOfServicePage from './public/pages/TermsOfServicePage';
import PrivateRoute from './private/PrivateRoute.jsx';
import ViewProfilePage from './private/pages/ViewProfilePage.jsx';
import AdminDashboardPage from './private/pages/AdminDashboardPage.jsx';
import AdminUsersPage from './private/pages/AdminUsersPage.jsx';
import AdminSettingsPage from './private/pages/AdminSettingsPage.jsx';
import DonorListPage from './private/pages/DonorListPage.jsx';
import AdminBloodRequestsPage from './private/pages/AdminBloodRequestsPage.jsx';
import AdminDonationsPage from './private/pages/AdminDonationsPage.jsx';
import AdminBloodRequestDetailPage from './private/pages/AdminBloodRequestDetailPage.jsx';
import AdminUserProfilePage from './private/pages/AdminUserProfilePage.jsx';
import AdminMediaManagementPage from './private/pages/AdminMediaManagementPage.jsx';
import BloodRequestDetailPage from './public/pages/BloodRequestDetailPage.jsx';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
    // On load, check localStorage for theme preference, default to light
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const stored = localStorage.getItem('theme');
        return stored === 'dark'; // true if 'dark', false otherwise (including null)
    });

    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

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
            <div className="overflow-x-hidden max-w-full">
                <ScrollToTop />
                {!isAdminRoute && <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
                <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<NewRegisterPage />} />
                <Route path="/register-old" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify/:userId" element={<VerificationPage />} />
                <Route path="/verify-email" element={<EmailVerificationPage />} />
                <Route path="/choose-verification-method" element={<VerificationMethodSelectionPage />} />
                <Route path="/email-verification-needed" element={<EmailVerificationNeededPage />} />
                <Route path="/sms-verification-needed" element={<SmsVerificationNeededPage />} />
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/blood-request/:id" element={<PrivateRoute><BloodRequestDetailPage /></PrivateRoute>} />
                <Route path="/register-donor" element={<DonorRegistrationPage />} />
                <Route path="/profile" element={<PrivateRoute><ViewProfilePage /></PrivateRoute>} />
                <Route path="/request" element={<PrivateRoute><RequestBloodPage /></PrivateRoute>} />
                <Route path="/find" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Donors Page - Coming Soon</h1></div>} />
                <Route path="/find-donor" element={<FindDonorPage />} />
                <Route path="/education" element={<EducationPage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/admin" element={<PrivateRoute requiredRole="admin"><AdminDashboardPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
                <Route path="/admin/users" element={<PrivateRoute requiredRole="admin"><AdminUsersPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
                <Route path="/admin/users/:id" element={<PrivateRoute requiredRole="admin"><AdminUserProfilePage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
                <Route path="/admin/donors" element={<PrivateRoute requiredRole="admin"><DonorListPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
                <Route path="/admin/settings" element={<PrivateRoute requiredRole="admin"><AdminSettingsPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
                <Route path="/admin/blood-requests" element={<PrivateRoute requiredRole="admin"><AdminBloodRequestsPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
                <Route path="/admin/media" element={<PrivateRoute requiredRole="admin"><AdminMediaManagementPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
                <Route path="/admin/donations" element={<PrivateRoute requiredRole="admin"><AdminDonationsPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
                <Route path="/admin/blood-requests/:id" element={<PrivateRoute requiredRole="admin"><AdminBloodRequestDetailPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
                {!isAdminRoute && <Footer />}
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

