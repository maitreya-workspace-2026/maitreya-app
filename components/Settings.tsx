
import React, { useState, useEffect } from 'react';
import { CalendarIcon, ContactsIcon, NotificationIcon, LocationIcon, LogoutIcon, MapIcon, SendIcon, ShieldCheckIcon } from './icons';
import { getPermissions, updatePermission, PermissionType } from '../services/tools';
import { AgeGroup } from '../types';

interface SettingsProps {
    isDyslexiaFriendly: boolean;
    setIsDyslexiaFriendly: (value: boolean) => void;
    isAlzheimerMode: boolean;
    setIsAlzheimerMode: (value: boolean) => void;
    onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isDyslexiaFriendly, setIsDyslexiaFriendly, isAlzheimerMode, setIsAlzheimerMode, onLogout }) => {
    
    const [permissionsState, setPermissionsState] = useState(getPermissions());
    const [isScamProtectionEnabled, setIsScamProtectionEnabled] = useState(false);
    const [isAgeRestricted, setIsAgeRestricted] = useState(false);

    useEffect(() => {
        // Load scam protection state
        const protectedState = localStorage.getItem('maitreya-scam-protection') === 'true';
        setIsScamProtectionEnabled(protectedState);

        // Check Age Restriction logic
        const ageGroup = localStorage.getItem('maitreya-user-age-group');
        if (ageGroup === AgeGroup['51-65'] || ageGroup === AgeGroup['66-85']) {
            setIsAgeRestricted(true);
            setIsScamProtectionEnabled(true); // Enforce true
        }
    }, []);

    const handleScamToggle = (checked: boolean) => {
        if (isAgeRestricted) return; // Prevent change if elderly
        setIsScamProtectionEnabled(checked);
        localStorage.setItem('maitreya-scam-protection', checked.toString());
    };

    const handlePermissionToggle = (key: PermissionType, value: boolean) => {
        updatePermission(key, value);
        setPermissionsState(prev => ({ ...prev, [key]: value }));
    };

    const permissionsList = [
        { key: 'calendar' as PermissionType, icon: <CalendarIcon className="w-6 h-6 text-indigo-400"/>, name: "Calendar Access", reason: "Create meetings & events" },
        { key: 'contacts' as PermissionType, icon: <ContactsIcon className="w-6 h-6 text-indigo-400"/>, name: "Contacts Access", reason: "Identify people for calls/messages" },
        { key: 'messages' as PermissionType, icon: <SendIcon className="w-6 h-6 text-indigo-400"/>, name: "Messages/SMS", reason: "Draft and send messages" },
        { key: 'email' as PermissionType, icon: <div className="w-6 h-6 flex items-center justify-center font-bold text-indigo-400">@</div>, name: "Email Access", reason: "Draft and send emails" },
        { key: 'location' as PermissionType, icon: <LocationIcon className="w-6 h-6 text-indigo-400"/>, name: "Location Access", reason: "Local weather & navigation" },
        { key: 'cabs' as PermissionType, icon: <MapIcon className="w-6 h-6 text-indigo-400"/>, name: "Cab Booking", reason: "Open ride-booking apps" },
    ];

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Settings</h2>

            <div className="space-y-8">
                {/* Scam Protection Module */}
                <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                         <ShieldCheckIcon className="w-24 h-24" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <ShieldCheckIcon className="w-6 h-6 text-red-400"/>
                        Scam Protection & Elder Safety
                    </h3>
                    <div className="flex items-center justify-between">
                        <div className="max-w-[80%]">
                            <p className="font-medium text-gray-200">Active Scam Monitoring</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Constantly analyzes inputs for "Digital Arrest", OTP fraud, and financial threats. 
                                {isAgeRestricted && <span className="block text-red-300 mt-1 font-bold">Mandatory for users aged 50+. Cannot be disabled.</span>}
                            </p>
                        </div>
                        <label htmlFor="scam-toggle" className={`relative inline-flex items-center ${isAgeRestricted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
                            <input
                                type="checkbox"
                                id="scam-toggle"
                                className="sr-only peer"
                                checked={isScamProtectionEnabled}
                                onChange={(e) => handleScamToggle(e.target.checked)}
                                disabled={isAgeRestricted}
                            />
                            <div className={`w-11 h-6 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-800 transition-colors ${isScamProtectionEnabled ? 'bg-red-600' : 'bg-gray-600'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                        </label>
                    </div>
                </div>

                {/* Accessibility & Support Settings */}
                <div className="bg-gray-800/50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-4">Accessibility & Specialized Support</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-200">Dyslexia Friendly Mode</p>
                            <p className="text-sm text-gray-400">Uses a serif font with more spacing for better readability.</p>
                        </div>
                        <label htmlFor="dyslexia-toggle" className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="dyslexia-toggle"
                                className="sr-only peer"
                                checked={isDyslexiaFriendly}
                                onChange={(e) => setIsDyslexiaFriendly(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                     <div className="mt-6 pt-6 border-t border-gray-700 flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-200">Alzheimer’s Patient Support</p>
                            <p className="text-sm text-gray-400">Enables routine reminders and interactive memory aids on the dashboard.</p>
                        </div>
                        <label htmlFor="alzheimer-toggle" className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="alzheimer-toggle"
                                className="sr-only peer"
                                checked={isAlzheimerMode}
                                onChange={(e) => setIsAlzheimerMode(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>

                {/* App Permissions */}
                <div className="bg-gray-800/50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-4">App Permissions & Privacy</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Control exactly what Maitreya can access. All data is processed locally and end-to-end encrypted. 
                        You can grant or revoke these permissions at any time.
                    </p>
                    <div className="space-y-4">
                        {permissionsList.map(p => (
                            <div key={p.key} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {p.icon}
                                    <div>
                                        <p className="font-medium text-gray-200">{p.name}</p>
                                        <p className="text-xs text-gray-400">{p.reason}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={permissionsState[p.key]}
                                        onChange={(e) => handlePermissionToggle(p.key, e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="pt-6 border-t border-gray-700">
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-3 bg-red-800/40 hover:bg-red-800/80 text-red-300 font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200"
                    >
                        <LogoutIcon className="w-6 h-6" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
