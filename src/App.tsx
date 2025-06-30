import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import SignLanguage from './pages/SignLanguage';
import SpeechRecognition from './pages/SpeechRecognition';
import Chat from './pages/Chat';
import VideoCall from './pages/VideoCall';
import Emergency from './pages/Emergency';
import Learning from './pages/Learning';
import QuickAccess from './pages/QuickAccess';
import Settings from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-language" element={<SignLanguage />} />
            <Route path="/speech-recognition" element={<SpeechRecognition />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/video-call" element={<VideoCall />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/quick-access" element={<QuickAccess />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;