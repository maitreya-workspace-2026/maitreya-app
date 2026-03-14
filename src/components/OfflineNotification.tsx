
import React, { useState, useEffect } from 'react';

const OfflineNotification: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-xs md:text-sm font-semibold text-center py-2 z-[9999] shadow-md animate-slideDown">
            <span>You are currently offline. Some AI features may be unavailable.</span>
        </div>
    );
};

export default OfflineNotification;
