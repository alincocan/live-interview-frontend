import './App.css';
import LoginPage from "./pages/LoginPage.tsx";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from "./pages/SignUpPage.tsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import ConfirmUserPage from "./pages/ConfirmUserPage.tsx";
import OAuth2RedirectPage from "./pages/OAuth2RedirectPage.tsx";
import ProfileUpdatePage from "./pages/ProfileUpdatePage.tsx";
import DashboardHome from "./pages/DashboardHome.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import ChooseInterviewerPage from "./pages/ChooseInterviewerPage.tsx";
import { getThemeByMode } from "./config/theme";
import { Box, ThemeProvider as MuiThemeProvider } from "@mui/material";
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import PageNotFound from './pages/PageNotFound.tsx';
import JobDescriptionUploadPage from './pages/interview-setup/JobDescriptionUploadPage';
import InterviewConfigurationPage from './pages/interview-setup/InterviewConfigurationPage';
import InterviewPage from './pages/InterviewPage.tsx';
import InterviewPreview from './pages/InterviewPreview.tsx';
import TrainingPreview from './pages/TrainingPreview.tsx';
import TrainingPage from './pages/TrainingPage.tsx';
import InterviewResultPage from './pages/InterviewResultPage.tsx';
import InterviewListPage from './pages/InterviewListPage.tsx';
import TrainingListPage from './pages/TrainingListPage.tsx';
import BookmarkedQuestionsPage from './pages/BookmarkedQuestionsPage.tsx';
import FinishSessionPage from './pages/FinishSessionPage.tsx';
import PaymentPage from './pages/PaymentPage.tsx';
import { ThemeProvider, useThemeContext } from './config/ThemeContext';
import PaymentSuccessPage from './pages/PaymentSuccessPage.tsx';

// Wrapper component that uses the theme context
const ThemedApp = () => {
    const { mode } = useThemeContext();
    const theme = getThemeByMode(mode);

    return (
        <MuiThemeProvider theme={theme}>
            <Box
                sx={{
                    backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.background.default : 'transparent',
                    background: (t) => t.palette.mode === 'light'
                        ? '#f8f8f8'
                        : 'linear-gradient(to bottom, #000000, #000846)',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    height: '100%',
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
                        <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
                        <Route path="/profile-update" element={<ProfileUpdatePage />} />
                        <Route path="/" element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardHome />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="settings" />
                            <Route path="interview/choose" element={<ChooseInterviewerPage />} />
                            <Route path="training/choose" element={<ChooseInterviewerPage />} />
                            <Route path="interview/upload" element={<JobDescriptionUploadPage />} />
                            <Route path="interview/setup" element={<InterviewConfigurationPage />} />
                            <Route path="training/setup" element={<InterviewConfigurationPage />} />
                            <Route path="interview/preview" element={<InterviewPreview />} />
                            <Route path="training/preview" element={<TrainingPreview />} />
                            <Route path="interview/session" element={<InterviewPage />} />
                            <Route path="training/session" element={<TrainingPage />} />
                            <Route path="interview/finish" element={<FinishSessionPage />} />
                            <Route path="training/finish" element={<FinishSessionPage />} />
                            <Route path="interview/list" element={<InterviewListPage />} />
                            <Route path="training/list" element={<TrainingListPage />} />
                            <Route path="interview/:interviewId" element={<InterviewResultPage />} />
                            <Route path="training/:interviewId" element={<InterviewResultPage />} />
                            <Route path="questions/bookmarked" element={<BookmarkedQuestionsPage />} />
                            <Route path="payment" element={<PaymentPage />} />
                            <Route path="payment/success" element={<PaymentSuccessPage />} />
                            {/*<Route path="details" element={<DetailsPage />} />*/}
                        </Route>
                        <Route path="*" element={<PageNotFound />} />
                    </Routes>
                </Router>
            </Box>
        </MuiThemeProvider>
    );
};

function App() {
    return (
        <ThemeProvider>
            <ThemedApp />
        </ThemeProvider>
    );
}

export default App
