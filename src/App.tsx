import {useEffect, useState} from 'react'
import './App.css'
import {useSpeech} from "./hooks/useSpeech";
import {ChatBubble} from "./components/ChatBubble";
import {Canvas} from "@react-three/fiber";
import {Avatar} from "./components/AvatarViewer";
import {OrbitControls, Environment} from "@react-three/drei";
// import {Desk} from "./components/Desk";
import {OfficeRoom} from "./components/OfficeRoom";
import LoginPage from "./components/pages/LoginPage";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from "./components/pages/SignUpPage";
import ForgotPasswordPage from "./components/pages/ForgotPasswordPage";
import ConfirmUserPage from "./components/pages/ConfirmUserPage";
import DashboardPage from "./components/pages/DashboardPage";
import DashboardHome from "./components/pages/DeshboardHome";
import ProfilePage from "./components/pages/ProfilePage";
import ChooseInterviewerPage from "./components/pages/ChooseInterviewerPage";
import {darkGreyTheme} from "./config/theme";
import {Box, ThemeProvider} from "@mui/material";
// const AVATAR_URL = 'https://models.readyplayer.me/6805036a2a9c5c70a466f5b8.glb';
const AVATAR_URL = 'models/man.glb';

function App() {
    const [message, setMessage] = useState("Hi! I'm your interviewer.");
    const { speak } = useSpeech();

    useEffect(() => {
        // speak(message);
    }, [message]);

    const askQuestion = () => {
        const q = "Can you tell me about yourself?";
        setMessage(q);
        speak(q);
    };

    return (
        // <div style={{ width: '100vw', height: '100vh', display: 'block' }}>
        //     <ChatBubble text={message} />
        //     <Canvas camera={{ position: [0, 0.5, 1] }}>
        //         <ambientLight intensity={0.5} />
        //         <directionalLight position={[0, 5, 5]} intensity={1} />
        //         <Environment preset="sunset" />
        //         <OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
        //         <OfficeRoom />
        //         <Avatar url={AVATAR_URL}/>
        //     </Canvas>
        //     <button
        //         onClick={askQuestion}
        //         style={{
        //             position: 'absolute',
        //             bottom: '2rem',
        //             left: '50%',
        //             transform: 'translateX(-50%)',
        //             padding: '10px 20px',
        //             fontSize: '16px',
        //         }}
        //     >
        //         Ask a Question
        //     </button>
        // </div>
        <ThemeProvider theme={darkGreyTheme}>
            <Box
                       sx={{backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                           backgroundSize: 'cover',
                           backgroundRepeat: 'no-repeat',
                           height: '100vh',
                           width: '100%',
                           backgroundPosition: 'center',
                       }}>
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/confirm" element={<ConfirmUserPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} >
                            <Route path="" element={<DashboardHome />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="choose" element={<ChooseInterviewerPage />} />
                            {/*<Route path="settings" element={<Settings />} />*/}
                            {/*<Route path="details" element={<DetailsPage />} />*/}
                        </Route>
                    </Routes>
                </Router>
            </Box>
        </ThemeProvider>
    );
}

export default App
