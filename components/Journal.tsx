
import React, { useState, useEffect, useRef } from 'react';
import { JournalEntry } from '../types';
import { MicIcon, PlayIcon, PauseIcon, TrashIcon, StopIcon } from './icons';

const JOURNAL_KEY = 'maitreya-journal-entries';

const Journal: React.FC = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [playingId, setPlayingId] = useState<string | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem(JOURNAL_KEY);
        if (stored) {
            try {
                setEntries(JSON.parse(stored));
            } catch (e) {
                console.error("Error loading journal entries", e);
            }
        }
    }, []);

    const saveEntries = (updated: JournalEntry[]) => {
        setEntries(updated);
        try {
            localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
        } catch (e) {
            alert("Storage full! Please delete old entries.");
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = reader.result as string;
                    const newEntry: JournalEntry = {
                        id: Date.now().toString(),
                        timestamp: Date.now(),
                        dateString: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
                        audioBase64: base64Audio,
                        durationSec: recordingTime
                    };
                    saveEntries([newEntry, ...entries]);
                    setRecordingTime(0);
                };
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const togglePlayback = (entry: JournalEntry) => {
        if (playingId === entry.id) {
            audioRef.current?.pause();
            setPlayingId(null);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            const audio = new Audio(entry.audioBase64);
            audioRef.current = audio;
            audio.play();
            setPlayingId(entry.id);
            audio.onended = () => setPlayingId(null);
        }
    };

    const deleteEntry = (id: string) => {
        if (confirm("Are you sure you want to delete this note?")) {
            saveEntries(entries.filter(e => e.id !== id));
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full p-4 md:p-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2">My Journal</h2>
            <p className="text-gray-400 mb-6">Record your thoughts, feelings, and memories for the future.</p>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center mb-8">
                <div className="text-4xl font-mono text-indigo-300 mb-4">{formatTime(recordingTime)}</div>
                {!isRecording ? (
                    <button 
                        onClick={startRecording}
                        className="w-16 h-16 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-105"
                    >
                        <MicIcon className="w-8 h-8 text-white" />
                    </button>
                ) : (
                    <button 
                        onClick={stopRecording}
                        className="w-16 h-16 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-105 animate-pulse"
                    >
                        <StopIcon className="w-8 h-8 text-white" />
                    </button>
                )}
                <p className="text-sm text-gray-400 mt-4">{isRecording ? "Recording... Tap to stop" : "Tap to record a new note"}</p>
            </div>

            <div className="space-y-4 overflow-y-auto pb-20">
                {entries.length === 0 && <p className="text-center text-gray-500 mt-8">No journal entries yet.</p>}
                {entries.map(entry => (
                    <div key={entry.id} className="bg-gray-800/80 p-4 rounded-lg flex items-center justify-between border border-gray-700/50">
                        <div>
                            <p className="text-white font-medium">{entry.dateString}</p>
                            <p className="text-xs text-gray-400">Duration: {formatTime(entry.durationSec)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => togglePlayback(entry)}
                                className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                            >
                                {playingId === entry.id ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                            </button>
                            <button 
                                onClick={() => deleteEntry(entry.id)}
                                className="p-3 rounded-full bg-gray-700 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Journal;
