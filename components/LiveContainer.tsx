
import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Removed non-exported member `LiveSession`.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

// Audio Encoding/Decoding Helpers
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


const LiveContainer: React.FC = () => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Ready to connect');
    const [transcripts, setTranscripts] = useState<{ speaker: 'user' | 'model'; text: string }[]>([]);
    
    // FIX: Using `any` for sessionRef as `LiveSession` is not a public type.
    const sessionRef = useRef<any | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const stopStreaming = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if(mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }, []);

    const startConversation = async () => {
        if (isSessionActive || !process.env.API_KEY) return;
        setIsSessionActive(true);
        setStatusMessage('Connecting...');
        setTranscripts([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();

            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            sessionRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setStatusMessage('Connected. Start speaking...');
                        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        const source = audioContextRef.current.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionRef.current?.then((session: any) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         if (message.serverContent?.inputTranscription) {
                            currentInputTranscription += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            setTranscripts(prev => [...prev, { speaker: 'user', text: currentInputTranscription }, { speaker: 'model', text: currentOutputTranscription }]);
                            currentInputTranscription = '';
                            currentOutputTranscription = '';
                        }
                        
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData) {
                            setStatusMessage('Receiving audio...');
                            const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContext.destination);
                            source.addEventListener('ended', () => sources.delete(source));
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(source);
                        }
                    },
                    onclose: () => {
                        setStatusMessage('Session closed.');
                        stopStreaming();
                        setIsSessionActive(false);
                    },
                    onerror: (e) => {
                        console.error('Session error:', e);
                        setStatusMessage('An error occurred.');
                        stopStreaming();
                        setIsSessionActive(false);
                    },
                },
            });

        } catch (error) {
            console.error("Failed to start conversation:", error);
            setStatusMessage('Failed to get microphone access.');
            setIsSessionActive(false);
        }
    };

    const stopConversation = () => {
        if (!isSessionActive) return;
        sessionRef.current?.then((session: any) => {
            session.close();
        });
        stopStreaming();
        setIsSessionActive(false);
        setStatusMessage('Disconnected');
    };

    useEffect(() => {
        return () => {
             stopConversation();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col h-full items-center p-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Live Conversation</h2>
            <p className="text-gray-400 mb-6 h-5">{statusMessage}</p>
            <button
                onClick={isSessionActive ? stopConversation : startConversation}
                className={`px-6 py-3 rounded-full text-md font-semibold transition-all duration-300 flex items-center justify-center
                    ${isSessionActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
                {isSessionActive ? 'Stop Conversation' : 'Start Conversation'}
            </button>
            <div className="w-full max-w-2xl mt-6 flex-1 overflow-y-auto bg-gray-900/50 rounded-lg p-2 space-y-3">
                 {transcripts.map((t, index) => (
                    <div key={index} className={`flex ${t.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <p className={`p-2 rounded-lg max-w-xs text-sm text-left ${t.speaker === 'user' ? 'bg-indigo-700' : 'bg-gray-700'}`}>{t.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveContainer;
