
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppMode } from './types';
import Dashboard from './components/Dashboard';
import ConversationContainer from './components/ConversationContainer';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import BottomNav from './components/BottomNav';
import OfflineNotification from './components/OfflineNotification';
import Journal from './components/Journal';
import Podcasts from './components/Podcasts';
import { SplashScreen } from '@capacitor/splash-screen';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { StatusBar, Style } from '@capacitor/status-bar';

export async function requestAppPermissions() {
    const result = {
        camera: false,
        microphone: false,
        location: false
    };

    try {
        // Camera
        const camera = await Camera.requestPermissions();
        result.camera = camera.camera === "granted";

        // Microphone
        const mic = await VoiceRecorder.requestAudioRecordingPermission();
        result.microphone = mic.value === true;

        // Location
        const location = await Geolocation.requestPermissions();
        result.location = location.location === "granted";

        return result.camera && result.microphone && result.location;

    } catch (err) {
        console.error("Permission error:", err);
        return result.camera && result.microphone && result.location;
    }
}

const App: React.FC = () => {
    // Persistent Login: Check localStorage on initialization
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('maitreya-auth') === 'true';
    });

    const [mode, setMode] = useState<AppMode>(AppMode.Dashboard);
    const [isDyslexiaFriendly, setIsDyslexiaFriendly] = useState(false);
    const [isAlzheimerMode, setIsAlzheimerMode] = useState(false);
    const [isAgentActive, setIsAgentActive] = useState(false);

    // Logout Confirmation State
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Trigger timestamp to signal Agent auto-start
    const [agentTrigger, setAgentTrigger] = useState<number | null>(null);

    const handleLogoutRequest = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setMode(AppMode.Dashboard);
        setShowLogoutConfirm(false);
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    // Listen for agent status from ConversationContainer
    useEffect(async () => {
        SplashScreen?.hide();
        await StatusBar.setBackgroundColor({ color: '#0f1927' });
        await StatusBar.setStyle({ style: Style.Dark });
        const permissions = await requestAppPermissions();

        if (permissions) {
            console.log("All permissions granted");
        } else {
            console.log("Some permissions denied", permissions);
        }
        const handleAgentStatus = (e: any) => {
            setIsAgentActive(e.detail);
        };
        window.addEventListener('maitreya-agent-active', handleAgentStatus);
        return () => window.removeEventListener('maitreya-agent-active', handleAgentStatus);
    }, []);

    // --- Android Friendly: Hardware Back Button Handling ---
    useEffect(() => {
        if (isAuthenticated) {
            window.history.pushState({ mode }, '', '');
        }

        const handlePopState = (event: PopStateEvent) => {
            if (!isAuthenticated) return;
            if (mode !== AppMode.Dashboard) {
                setMode(AppMode.Dashboard);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [mode, isAuthenticated]);

    // --- Wake Word Logic (Global) ---
    useEffect(() => {
        if (!isAuthenticated || isAgentActive) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        const aiName = localStorage.getItem('maitreya-ai-name') || 'Maitreya';
        const wakeWord = `hey ${aiName.toLowerCase()}`;

        let isListening = true;
        let restartTimer: any = null;

        recognition.onresult = (event: any) => {
            if (!isListening) return;
            const results = event.results;
            const transcript = results[results.length - 1][0].transcript.toLowerCase();

            if (transcript.includes(wakeWord)) {
                console.log("Wake word detected:", wakeWord);
                isListening = false;
                recognition.stop();
                setMode(AppMode.Conversation);
                setAgentTrigger(Date.now());
            }
        };

        recognition.onend = () => {
            if (isAuthenticated && mode !== AppMode.Conversation && isListening && !isAgentActive) {
                restartTimer = setTimeout(() => {
                    try { recognition.start(); } catch (e) { }
                }, 4000);
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                isListening = false;
            }
        };

        try { recognition.start(); } catch (e) { }

        return () => {
            isListening = false;
            recognition.stop();
            if (restartTimer) clearTimeout(restartTimer);
        };
    }, [isAuthenticated, mode, isAgentActive]);


    const renderContent = useCallback(() => {
        switch (mode) {
            case AppMode.Dashboard:
                return <Dashboard setMode={setMode} isAlzheimerMode={isAlzheimerMode} />;
            case AppMode.Conversation:
                return <ConversationContainer agentTriggerTimestamp={agentTrigger} />;
            case AppMode.Journal:
                return <Journal />;
            case AppMode.Podcasts:
                return <Podcasts />;
            case AppMode.Settings:
                return <Settings
                    isDyslexiaFriendly={isDyslexiaFriendly}
                    setIsDyslexiaFriendly={setIsDyslexiaFriendly}
                    isAlzheimerMode={isAlzheimerMode}
                    setIsAlzheimerMode={setIsAlzheimerMode}
                    onLogout={handleLogoutRequest}
                />;
            default:
                return <Dashboard setMode={setMode} isAlzheimerMode={isAlzheimerMode} />;
        }
    }, [mode, isDyslexiaFriendly, isAlzheimerMode, agentTrigger]);

    if (!isAuthenticated) {
        return <Auth onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className={`flex flex-col h-[100dvh] w-full bg-gray-900 text-gray-100 ${isDyslexiaFriendly ? 'font-serif tracking-wide leading-relaxed' : 'font-sans'}`}>
            <OfflineNotification />

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in touch-none">
                    <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Logout Confirmation</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to log out? This will stop all background monitoring and you will need to sign in again.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-semibold transition-colors active:scale-95 transform"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 rounded-xl text-white font-semibold transition-colors shadow-lg active:scale-95 transform"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar currentMode={mode} setMode={setMode} onLogout={handleLogoutRequest} />
                <main className="flex-1 flex flex-col h-full bg-gray-800/50 relative w-full pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 pt-4 md:pt-6">
                        {renderContent()}
                    </div>
                </main>
            </div>
            <BottomNav currentMode={mode} setMode={setMode} />
        </div>
    );
};

export default App;
