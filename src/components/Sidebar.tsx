
import React, { useState } from 'react';
import { AppMode } from '../types';
import { HomeIcon, MicIcon, SettingsIcon, LogoutIcon, JournalIcon, HeadphonesIcon } from './icons';
import { logoDataUri } from '../assets/logo';

interface SidebarProps {
    currentMode: AppMode;
    setMode: (mode: AppMode) => void;
    onLogout: () => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    mode: AppMode;
    currentMode: AppMode;
    onClick: () => void;
}> = ({ icon, label, mode, currentMode, onClick }) => {
    const isActive = currentMode === mode;
    return (
        <button
            onClick={onClick}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {icon}
            <span className="ml-4">{label}</span>
        </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode, onLogout }) => {
    const [aiName] = useState(() => localStorage.getItem('maitreya-ai-name') || 'Maitreya');

    const navItems = [
        { icon: <HomeIcon className="w-6 h-6" />, label: 'Home', mode: AppMode.Dashboard },
        { icon: <MicIcon className="w-6 h-6" />, label: 'Conversation', mode: AppMode.Conversation },
        { icon: <JournalIcon className="w-6 h-6" />, label: 'My Journal', mode: AppMode.Journal },
        { icon: <HeadphonesIcon className="w-6 h-6" />, label: 'Podcasts', mode: AppMode.Podcasts },
    ];

    return (
        <aside className="w-64 bg-gray-900/70 backdrop-blur-sm flex-col p-4 border-r border-gray-700/50 hidden md:flex">
            <div className="flex items-center mb-8 px-2">
                <img src={logoDataUri} alt="App Logo" className="w-10 h-10" />
                <h1 className="ml-3 text-xl font-bold text-white uppercase">{aiName}</h1>
            </div>
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavItem
                        key={item.mode}
                        icon={item.icon}
                        label={item.label}
                        mode={item.mode}
                        currentMode={currentMode}
                        onClick={() => setMode(item.mode)}
                    />
                ))}
            </nav>
            <div className="mt-auto space-y-2">
                <NavItem
                    icon={<SettingsIcon className="w-6 h-6" />}
                    label={AppMode.Settings}
                    mode={AppMode.Settings}
                    currentMode={currentMode}
                    onClick={() => setMode(AppMode.Settings)}
                />
                 <button
                    onClick={onLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-red-800/50 hover:text-white transition-all duration-200"
                >
                    <LogoutIcon className="w-6 h-6" />
                    <span className="ml-4">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
