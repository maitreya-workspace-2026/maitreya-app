
import React, { useState, useEffect, useCallback } from 'react';
import { AppMode, Reminder, ImportantDate, MemoryAidFace, MemoryAidPlace } from '../types';
import { MicIcon, PillIcon, UtensilsIcon, WaterDropIcon, CheckCircleIcon, PlusCircleIcon, TrashIcon, ShieldCheckIcon, CalendarIcon, HeartIcon, BriefcaseIcon } from './icons';
import { logoDataUri } from '../assets/logo';

const REMINDERS_KEY = 'maitreya-reminders';
const IMPORTANT_DATES_KEY = 'maitreya-important-dates';
const FACES_KEY = 'maitreya-faces';
const PLACES_KEY = 'maitreya-places';

const conversationStarters = [
    "What's been on your mind lately?",
    "Tell me about something that made you smile today.",
    "If you could go anywhere in the world right now, where would it be?",
    "What's a small goal you're working towards?",
    "Is there a memory you've been thinking about recently?",
];

const ProactivePlanningCard: React.FC<{ event: ImportantDate }> = ({ event }) => (
    <div className="w-full bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/50 rounded-2xl p-6 mb-8 animate-pulse-slow shadow-xl">
        <div className="flex items-center gap-4 mb-3">
            <div className="bg-purple-500 p-2 rounded-full">
                <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Upcoming: {event.event}</h3>
        </div>
        <p className="text-purple-200 text-sm mb-4">This is happening tomorrow! Reason: {event.reason}. Shall we discuss arrangements like reservations or gifts?</p>
        <div className="flex gap-2">
            <button className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors">Start Planning</button>
            <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors">Dismiss</button>
        </div>
    </div>
);

const DefaultDashboard: React.FC<{ setMode: (mode: AppMode) => void; }> = ({ setMode }) => {
    const [starter, setStarter] = useState('');
    const [aiName] = useState(() => localStorage.getItem('maitreya-ai-name') || 'Maitreya');
    const [isScamProtected, setIsScamProtected] = useState(false);
    const [proactiveEvent, setProactiveEvent] = useState<ImportantDate | null>(null);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);

    const loadDashboardData = useCallback(() => {
        const r: Reminder[] = JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]');
        const d: ImportantDate[] = JSON.parse(localStorage.getItem(IMPORTANT_DATES_KEY) || '[]');
        setReminders(r);
        setImportantDates(d);

        // Check for proactive event (due tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const upcoming = d.find(event => {
            if (event.isRecurring) {
                return event.date.slice(5) === tomorrowStr.slice(5);
            }
            return event.date === tomorrowStr;
        });
        setProactiveEvent(upcoming || null);
        setIsScamProtected(localStorage.getItem('maitreya-scam-protection') === 'true');
    }, []);

    useEffect(() => {
        setStarter(conversationStarters[Math.floor(Math.random() * conversationStarters.length)]);
        loadDashboardData();
        
        window.addEventListener('storage', loadDashboardData);
        window.addEventListener('maitreya-data-update', loadDashboardData);
        return () => {
            window.removeEventListener('storage', loadDashboardData);
            window.removeEventListener('maitreya-data-update', loadDashboardData);
        };
    }, [loadDashboardData]);

    const toggleReminder = (id: number) => {
        const updated = reminders.map(r => r.id === id ? { ...r, done: !r.done } : r);
        localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
        setReminders(updated);
    };

    const deleteImportantDate = (id: number) => {
        const updated = importantDates.filter(d => d.id !== id);
        localStorage.setItem(IMPORTANT_DATES_KEY, JSON.stringify(updated));
        setImportantDates(updated);
    };

    const getIcon = (reminder: Reminder) => {
        if (reminder.category === 'Professional') return <BriefcaseIcon className="w-6 h-6 text-indigo-400" />;
        return <HeartIcon className="w-6 h-6 text-rose-400" />;
    }

     return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 relative">
            {isScamProtected && (
                <div className="absolute top-0 right-0 flex items-center gap-1 bg-green-900/50 px-3 py-1 rounded-full border border-green-700/50 z-10">
                    <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                    <span className="text-[10px] text-green-300 font-bold uppercase tracking-wider">Scam Guard Active</span>
                </div>
            )}

            {proactiveEvent && <ProactivePlanningCard event={proactiveEvent} />}

            <div className="flex flex-col items-center mb-10">
                <img src={logoDataUri} alt="App Avatar" className="w-24 h-24 mb-4 drop-shadow-2xl" />
                <h1 className="text-3xl font-bold text-white mb-1">Namaste, I'm {aiName}</h1>
                <p className="text-gray-400 text-center max-w-sm">{starter}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Categorized Reminders */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-indigo-400" />
                        Today's Agenda
                    </h2>
                    <div className="space-y-3">
                        {reminders.length === 0 && <p className="text-sm text-gray-500 italic">No reminders for today.</p>}
                        {reminders.map(rem => (
                            <div key={rem.id} className={`flex items-center p-3 rounded-xl border transition-all ${rem.done ? 'bg-gray-800/20 border-gray-700/50 opacity-50' : 'bg-gray-800/60 border-gray-700'}`}>
                                {getIcon(rem)}
                                <div className="ml-3 flex-1 min-w-0">
                                    <p className={`font-semibold truncate ${rem.done ? 'line-through text-gray-500' : 'text-white'}`}>{rem.title}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold tracking-tighter text-gray-400">{rem.time}</span>
                                        <span className={`text-[10px] px-1.5 rounded-sm font-bold uppercase ${rem.category === 'Professional' ? 'bg-indigo-900/40 text-indigo-300' : 'bg-rose-900/40 text-rose-300'}`}>{rem.category}</span>
                                    </div>
                                </div>
                                <button onClick={() => toggleReminder(rem.id)} className={`p-1.5 rounded-lg border ${rem.done ? 'bg-green-600 border-green-500' : 'border-gray-500'}`}>
                                    <CheckCircleIcon className={`w-5 h-5 ${rem.done ? 'text-white' : 'text-gray-500'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Important Dates */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-purple-400" />
                        Key Milestones
                    </h2>
                    <div className="space-y-3">
                        {importantDates.length === 0 && <p className="text-sm text-gray-500 italic">No important dates saved yet.</p>}
                        {importantDates.map(date => (
                            <div key={date.id} className="bg-gray-800/40 border border-gray-700/50 p-3 rounded-xl flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-purple-600 text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase">{date.date}</span>
                                        <h4 className="text-sm font-bold text-white">{date.event}</h4>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-1">{date.reason}</p>
                                </div>
                                <button onClick={() => deleteImportantDate(date.id)} className="text-gray-600 hover:text-red-400 p-1">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-auto flex justify-center pb-8">
                <button
                    onClick={() => setMode(AppMode.Conversation)}
                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all transform active:scale-95"
                >
                    <MicIcon className="w-6 h-6" />
                    Speak with {aiName}
                </button>
            </div>
            
             <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-center">
                <p className="text-xs text-red-200">Emergency Distress? Contact 112 (India) or professional help immediately.</p>
            </div>
        </div>
    );
}

const AlzheimerDashboard: React.FC<{ setMode: (mode: AppMode) => void; }> = ({ setMode }) => {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [faces, setFaces] = useState<MemoryAidFace[]>([]);
    const [places, setPlaces] = useState<MemoryAidPlace[]>([]);
    const [aiName] = useState(() => localStorage.getItem('maitreya-ai-name') || 'Maitreya');

    const loadData = useCallback(() => {
        setReminders(JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]'));
        setFaces(JSON.parse(localStorage.getItem(FACES_KEY) || '[]'));
        setPlaces(JSON.parse(localStorage.getItem(PLACES_KEY) || '[]'));
    }, []);

    useEffect(() => {
        loadData();
        window.addEventListener('maitreya-data-update', loadData);
        return () => window.removeEventListener('maitreya-data-update', loadData);
    }, [loadData]);
    
    const toggleReminder = (id: number) => {
        const updated = reminders.map(r => r.id === id ? { ...r, done: !r.done } : r);
        localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
        setReminders(updated);
    };

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                 <h1 className="text-3xl font-bold text-white mb-2">Hello, I'm {aiName}</h1>
                 <p className="text-md text-gray-400">Here's your gentle guide for today.</p>
            </div>

            <div className="mb-10">
                <h2 className="text-xl font-bold text-white mb-4">Daily Care Plan</h2>
                <div className="space-y-4">
                    {reminders.map(reminder => (
                        <div key={reminder.id} className={`flex items-center p-4 rounded-2xl border transition-all ${reminder.done ? 'bg-green-900/20 border-green-800/30' : 'bg-gray-800/60 border-gray-700'}`}>
                           <div className={`p-2 rounded-lg ${reminder.category === 'Professional' ? 'bg-indigo-500/20' : 'bg-rose-500/20'}`}>
                             {reminder.category === 'Professional' ? <BriefcaseIcon className="w-8 h-8 text-indigo-400" /> : <HeartIcon className="w-8 h-8 text-rose-400" />}
                           </div>
                           <div className="ml-4 flex-grow">
                                <p className={`text-lg font-bold ${reminder.done ? 'line-through text-gray-500' : 'text-white'}`}>{reminder.title}</p>
                                <p className="text-sm text-gray-400">{reminder.time} • {reminder.category}</p>
                           </div>
                           <button onClick={() => toggleReminder(reminder.id)} className={`p-2 rounded-full ${reminder.done ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'border-2 border-gray-600'}`}>
                               <CheckCircleIcon className={`w-8 h-8 ${reminder.done ? 'text-white' : 'text-gray-500'}`} />
                           </button>
                        </div>
                    ))}
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><HeartIcon className="w-5 h-5 text-rose-400"/> Familiar Faces</h2>
                    <div className="flex flex-wrap gap-4">
                        {faces.map(face => (
                            <div key={face.id} className="bg-gray-800/60 rounded-2xl p-4 flex flex-col items-center w-32">
                                <img src={face.image} alt={face.name} className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-gray-600 shadow-md"/>
                                <h3 className="font-bold text-white text-sm text-center">{face.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-indigo-400"/> Important Places</h2>
                    <div className="flex flex-wrap gap-4">
                        {places.map(place => (
                            <div key={place.id} className="bg-gray-800/60 rounded-2xl p-4 flex flex-col items-center w-32">
                                <img src={place.image} alt={place.name} className="w-20 h-20 rounded-lg object-cover mb-2 border-2 border-gray-600 shadow-md"/>
                                <h3 className="font-bold text-white text-sm text-center">{place.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-auto py-8">
                <button
                    onClick={() => setMode(AppMode.Conversation)}
                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 px-12 rounded-full shadow-2xl transition-transform active:scale-95"
                >
                    <MicIcon className="w-8 h-8" />
                    Talk to me
                </button>
            </div>
        </div>
    );
};

interface DashboardProps {
    setMode: (mode: AppMode) => void;
    isAlzheimerMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ setMode, isAlzheimerMode }) => {
    if (isAlzheimerMode) {
        return <AlzheimerDashboard setMode={setMode} />;
    }
    return <DefaultDashboard setMode={setMode} />;
};

export default Dashboard;
