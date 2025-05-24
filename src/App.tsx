import './App.css';
import LoginPage from "./pages/LoginPage.tsx";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from "./pages/SignUpPage.tsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import ConfirmUserPage from "./pages/ConfirmUserPage.tsx";
import OAuth2RedirectPage from "./pages/OAuth2RedirectPage.tsx";
import ProfileUpdatePage from "./pages/ProfileUpdatePage.tsx";
import DashboardHome from "./pages/DeshboardHome.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import ChooseInterviewerPage from "./pages/ChooseInterviewerPage.tsx";
import { darkGreyTheme } from "./config/theme";
import { Box, ThemeProvider } from "@mui/material";
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import PageNotFound from './pages/PageNotFound.tsx';
import JobDescriptionUploadPage from './pages/interview-setup/JobDescriptionUploadPage';
import InterviewConfigurationPage from './pages/interview-setup/InterviewConfigurationPage';
import InterviewPageOld from './pages/InterviewPageOld.tsx';
import InterviewPage from './pages/InterviewPage.tsx';
import InterviewPreview from './pages/InterviewPreview.tsx';
import InterviewResultPage from './pages/InterviewResultPage.tsx';
import InterviewListPage from './pages/InterviewListPage.tsx';
import BookmarkedQuestionsPage from './pages/BookmarkedQuestionsPage.tsx';
import FinishInterviewPage from './pages/FinishInterviewPage.tsx';

function App() {

    return (
        <ThemeProvider theme={darkGreyTheme}>
            <Box
                sx={{
                    //backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    background: 'linear-gradient(to bottom, #000000, #000846)',
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
                            <Route path="interview/questions" element={<InterviewPageOld />} />
                            <Route path="interview/session" element={<InterviewPage />} />
                            <Route path="interview/finish" element={<FinishInterviewPage />} />
                            <Route path="interview/list" element={<InterviewListPage />} />
                            <Route path="interview/:interviewId" element={<InterviewResultPage />} />
                            <Route path="questions/bookmarked" element={<BookmarkedQuestionsPage />} />
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
