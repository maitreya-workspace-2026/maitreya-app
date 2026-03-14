
import React from 'react';
import { AppMode } from '../types';
import { HomeIcon, MicIcon, SettingsIcon, JournalIcon, HeadphonesIcon } from './icons';

interface BottomNavProps {
    currentMode: AppMode;
    setMode: (mode: AppMode) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    mode: AppMode;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full pt-3 pb-2 transition-colors duration-200 active:scale-95 transform ${
            isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
        }`}
    >
        {icon}
        <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
);


const BottomNav: React.FC<BottomNavProps> = ({ currentMode, setMode }) => {
    const navItems = [
        { icon: <HomeIcon className="w-6 h-6" />, label: "Home", mode: AppMode.Dashboard },
        { icon: <MicIcon className="w-6 h-6" />, label: "Speak", mode: AppMode.Conversation },
        { icon: <JournalIcon className="w-6 h-6" />, label: "Journal", mode: AppMode.Journal },
        { icon: <HeadphonesIcon className="w-6 h-6" />, label: "Listen", mode: AppMode.Podcasts },
        { icon: <SettingsIcon className="w-6 h-6" />, label: "Settings", mode: AppMode.Settings },
    ];

    return (
        // Android Friendly: Add padding-bottom for safe-area (gesture bar)
        // Using pb-[env(safe-area-inset-bottom)] ensures content isn't covered by the home bar
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 z-50 pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavItem
                        key={item.mode}
                        icon={item.icon}
                        label={item.label}
                        mode={item.mode}
                        isActive={currentMode === item.mode}
                        onClick={() => setMode(item.mode)}
                    />
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
