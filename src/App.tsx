import './App.css';
import LoginPage from "./components/pages/LoginPage";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from "./components/pages/SignUpPage";
import ForgotPasswordPage from "./components/pages/ForgotPasswordPage";
import ResetPasswordPage from "./components/pages/ResetPasswordPage";
import ConfirmUserPage from "./components/pages/ConfirmUserPage";
import DashboardHome from "./components/pages/DeshboardHome";
import ProfilePage from "./components/pages/ProfilePage";
import ChooseInterviewerPage from "./components/pages/ChooseInterviewerPage";
import { darkGreyTheme } from "./config/theme";
import { Box, ThemeProvider } from "@mui/material";
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import PageNotFound from './components/pages/PageNotFound';

function App() {

    return (
        <ThemeProvider theme={darkGreyTheme}>
            <Box
                sx={{
                    backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    height: '100vh',
                    width: '100%',
                    backgroundPosition: 'center',
                }}>
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/confirm" element={<ConfirmUserPage />} />
                        <Route path="/" element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardHome />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="choose" element={<ChooseInterviewerPage />} />
                            <Route path="settings" />
                            {/*<Route path="details" element={<DetailsPage />} />*/}
                        </Route>
                        <Route path="*" element={<PageNotFound />} />
                    </Routes>
                </Router>
            </Box>
        </ThemeProvider>
    );
}

export default App
