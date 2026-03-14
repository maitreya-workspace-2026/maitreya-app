
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Message } from '../types';
import * as geminiService from '../services/geminiService';
import * as tools from '../services/tools';
import { MicIcon, MicOffIcon, LogoutIcon, SendIcon } from './icons';
import { logoDataUri } from '../assets/logo';

function encode(bytes: Uint8Array): string { 
  let binary = ''; 
  const len = bytes.byteLength; 
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]); 
  return btoa(binary); 
}

function decode(base64: string): Uint8Array { 
  const binaryString = atob(base64); 
  const len = binaryString.length; 
  const bytes = new Uint8Array(len); 
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i); 
  return bytes; 
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { 
  const dataInt16 = new Int16Array(data.buffer); 
  const frameCount = dataInt16.length / numChannels; 
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate); 
  for (let channel = 0; channel < numChannels; channel++) { 
    const channelData = buffer.getChannelData(channel); 
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; 
  } 
  return buffer; 
}

const NeonSphere: React.FC<{ state: 'idle' | 'listening' | 'thinking' | 'speaking' }> = ({ state }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
        let animationFrame: number; const width = canvas.width; const height = canvas.height; const cx = width / 2; const cy = height / 2;
        const particleCount = 45; const particles: any[] = []; const colors = ['#6366f1', '#a855f7', '#3b82f6', '#ec4899'];
        for (let i = 0; i < particleCount; i++) particles.push({ angle: Math.random() * Math.PI * 2, radius: 40 + Math.random() * 80, speed: 0.008 + Math.random() * 0.012, size: 1.2 + Math.random(), color: colors[Math.floor(Math.random() * colors.length)], phase: Math.random() * Math.PI * 2 });
        let time = 0;
        const render = () => {
            ctx.clearRect(0, 0, width, height);
            let corePulse = Math.sin(time * 2) * 5; let rotationSpeed = 1;
            if (state === 'listening') { corePulse = Math.sin(time * 8) * 12; rotationSpeed = 1.2; }
            else if (state === 'thinking') { rotationSpeed = 6; corePulse = Math.sin(time * 4) * 2; }
            else if (state === 'speaking') { corePulse = Math.sin(time * 12) * 22; rotationSpeed = 2; }
            const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, 110 + corePulse);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
            gradient.addColorStop(0.6, 'rgba(168, 85, 247, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.beginPath(); ctx.arc(cx, cy, 130 + corePulse, 0, Math.PI * 2); ctx.fillStyle = gradient; ctx.fill();
            particles.forEach(p => { 
                p.angle += p.speed * rotationSpeed; 
                const wobble = Math.sin(time * 3 + p.phase) * 5;
                const x = cx + Math.cos(p.angle) * (p.radius + wobble); 
                const y = cy + Math.sin(p.angle) * (p.radius + wobble); 
                ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill(); 
            });
            time += 0.02; animationFrame = requestAnimationFrame(render);
        };
        render(); return () => cancelAnimationFrame(animationFrame);
    }, [state]);
    return <canvas ref={canvasRef} width={400} height={400} className="w-80 h-80 md:w-96 md:h-96 pointer-events-none" />;
};

const ConversationContainer: React.FC<{ agentTriggerTimestamp?: number | null }> = ({ agentTriggerTimestamp }) => {
    const [messages, setMessages] = useState<Message[]>(() => JSON.parse(localStorage.getItem('maitreya-history') || '[]'));
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [agentMode, setAgentMode] = useState(false);
    const [aiState, setAIState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
    const [statusText, setStatusText] = useState("Initializing session...");
    const [isMuted, setIsMuted] = useState(false);
    const isMutedRef = useRef(false);

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const connectionTimeoutRef = useRef<number | null>(null);
    const isSessionActiveRef = useRef(false);

    useEffect(() => { localStorage.setItem('maitreya-history', JSON.stringify(messages)); }, [messages]);

    useEffect(() => {
        if (agentTriggerTimestamp) activateAgent();
        return () => deactivateAgent();
    }, [agentTriggerTimestamp]);

    const stopStreaming = useCallback(() => {
        isSessionActiveRef.current = false;
        if (mediaStreamRef.current) { 
            mediaStreamRef.current.getTracks().forEach(t => t.stop()); 
            mediaStreamRef.current = null; 
        }
        if (processorNodeRef.current) {
            processorNodeRef.current.disconnect();
            processorNodeRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') { 
            outputAudioContextRef.current.close(); 
            outputAudioContextRef.current = null; 
        }
        if (connectionTimeoutRef.current) window.clearTimeout(connectionTimeoutRef.current);
        sessionPromiseRef.current = null;
    }, []);

    const startLiveSession = useCallback(async () => {
        if (!process.env.API_KEY || !navigator.onLine) {
            setStatusText("No connection available.");
            return;
        }
        stopStreaming();
        setAIState('listening');
        setStatusText("Ready to listen");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            await outputAudioContextRef.current.resume();

            const interests = localStorage.getItem('maitreya-user-interests') || "[]";
            const systemInstruction = `${geminiService.MAITREYA_SYSTEM_INSTRUCTION}\n\nUSER FAVORITES (Historical Context for Proactive Initiation): ${interests}`;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let nextStartTime = 0;
            let currentInputTranscription = '';

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: { 
                    responseModalities: [Modality.AUDIO], 
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                    tools: [{ functionDeclarations: tools.availableTools }],
                    systemInstruction,
                    thinkingConfig: { thinkingBudget: 0 },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {} // Still enable for logging but won't show in UI
                },
                callbacks: {
                    onopen: () => {
                        isSessionActiveRef.current = true;
                        setStatusText("Connected");
                        const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        inputAudioContextRef.current = inCtx;
                        const source = inCtx.createMediaStreamSource(stream);
                        const proc = inCtx.createScriptProcessor(4096, 1, 1);
                        processorNodeRef.current = proc;
                        proc.onaudioprocess = (e) => {
                            if (!isSessionActiveRef.current) return;
                            const data = e.inputBuffer.getChannelData(0);
                            const int16 = new Int16Array(data.length);
                            for (let i = 0; i < data.length; i++) {
                                int16[i] = isMutedRef.current ? 0 : data[i] * 32768;
                            }
                            const pcmBlob: Blob = { 
                                data: encode(new Uint8Array(int16.buffer)), 
                                mimeType: 'audio/pcm;rate=16000' 
                            };
                            sessionPromise.then(s => {
                                if (isSessionActiveRef.current) {
                                    s.sendRealtimeInput({ media: pcmBlob });
                                }
                            }).catch(err => console.warn("Send audio failed:", err));
                        };
                        source.connect(proc); proc.connect(inCtx.destination);
                    },
                    onmessage: async (msg) => {
                        // CAPTION REMOVAL: input/output transcription is processed silently for message history
                        if (msg.serverContent?.inputTranscription) {
                            currentInputTranscription += msg.serverContent.inputTranscription.text;
                        }
                        
                        if (msg.toolCall) {
                            setAIState('thinking');
                            setStatusText("Updating logic...");
                            for (const fc of msg.toolCall.functionCalls) {
                                try {
                                    const toolFunc = (tools as any)[fc.name];
                                    const result = toolFunc ? toolFunc(...Object.values(fc.args)) : { error: "Diagnostic: Internal Tool Misalignment" };
                                    sessionPromise.then(s => {
                                        if (isSessionActiveRef.current) {
                                            s.sendToolResponse({ 
                                                functionResponses: { id: fc.id, name: fc.name, response: { result } } 
                                            });
                                        }
                                    });
                                } catch (e) {
                                    // Internal Error Identification Logic
                                    sessionPromise.then(s => {
                                        if (isSessionActiveRef.current) {
                                            s.sendToolResponse({ 
                                                functionResponses: { id: fc.id, name: fc.name, response: { error: "Agentic Disruption: Internal failure detected during processing" } } 
                                            });
                                        }
                                    });
                                }
                            }
                        }

                        const audio = msg.serverContent?.modelTurn?.parts?.find(p => p.inlineData)?.inlineData?.data;
                        if (audio && outputAudioContextRef.current) {
                            setAIState('speaking');
                            setStatusText("Speaking");
                            const buf = await decodeAudioData(decode(audio), outputAudioContextRef.current, 24000, 1);
                            const src = outputAudioContextRef.current.createBufferSource();
                            src.buffer = buf; 
                            src.connect(outputAudioContextRef.current.destination);
                            src.onended = () => { 
                                if (outputAudioContextRef.current && outputAudioContextRef.current.currentTime >= nextStartTime - 0.2) { 
                                    setAIState('listening'); 
                                    setStatusText("Listening"); 
                                } 
                            };
                            nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
                            src.start(nextStartTime); 
                            nextStartTime += buf.duration;
                        }

                        if (msg.serverContent?.turnComplete) {
                            if (currentInputTranscription.trim()) {
                                setMessages(p => [...p, { id: Date.now().toString(), sender: 'user', text: currentInputTranscription }]);
                            }
                            currentInputTranscription = '';
                        }
                    },
                    onerror: (e) => { 
                        console.error("Live Error Diagnostic:", e);
                        setStatusText("Analyzing connection..."); 
                        stopStreaming(); 
                        setTimeout(startLiveSession, 3000); 
                    },
                    onclose: () => { 
                        isSessionActiveRef.current = false;
                        setAIState('idle');
                        setStatusText("Session Ended");
                        stopStreaming();
                    }
                }
            });
            sessionPromiseRef.current = sessionPromise;
        } catch (e) { 
            console.error("Foundation Error:", e);
            setStatusText("Microphone access required.");
            stopStreaming(); 
        }
    }, [stopStreaming]);

    const activateAgent = async () => { 
        setAgentMode(true); 
        isMutedRef.current = false; 
        setIsMuted(false); 
        window.dispatchEvent(new CustomEvent('maitreya-agent-active', { detail: true })); 
        await startLiveSession(); 
    };

    const deactivateAgent = () => { 
        setAgentMode(false); 
        sessionPromiseRef.current?.then(s => s.close()); 
        stopStreaming(); 
        window.dispatchEvent(new CustomEvent('maitreya-agent-active', { detail: false })); 
    };

    const handleManualSend = async () => {
        if (!input.trim() || isLoading) return;
        const msg: Message = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages(p => [...p, msg]); 
        setInput(''); 
        setIsLoading(true);
        try { 
            const res = await geminiService.generateUnifiedResponse(input, null, null); 
            setMessages(p => [...p, { id: Date.now().toString(), sender: 'bot', text: res.text }]); 
        } finally { 
            setIsLoading(false); 
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-950 overflow-hidden relative">
            {agentMode ? (
                <div className="fixed inset-0 z-[1000] bg-gray-950 flex flex-col items-center justify-center p-8 animate-fade-in touch-none">
                    <div className="absolute top-10 right-10 flex gap-4">
                        <button onClick={() => { setIsMuted(!isMuted); isMutedRef.current = !isMutedRef.current; }} className={`p-5 rounded-full transition-all shadow-2xl active:scale-90 ${isMuted ? 'bg-orange-600' : 'bg-gray-800'}`}>
                            {isMuted ? <MicOffIcon className="w-7 h-7 text-white" /> : <MicIcon className="w-7 h-7 text-white" />}
                        </button>
                        <button onClick={deactivateAgent} className="p-5 bg-red-600 rounded-full text-white shadow-2xl active:scale-90 transition-transform">
                            <LogoutIcon className="w-7 h-7" />
                        </button>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center w-full">
                        <NeonSphere state={aiState} />
                        <div className="mt-16 text-center">
                            <h2 className="text-3xl font-black text-white mb-3 tracking-[0.2em] uppercase">MAITREYA</h2>
                            <p className="text-indigo-400 font-bold tracking-[0.15em] uppercase text-xs opacity-60">
                                {isMuted ? "Agent Suspended" : statusText}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full p-4 md:p-6">
                    <div className="flex flex-col items-center mb-10 mt-4">
                        <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.4)] cursor-pointer active:scale-95 hover:scale-105 transition-all" onClick={activateAgent}>
                            <MicIcon className="w-12 h-12 text-white" />
                        </div>
                        <p className="mt-5 text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em]">Start Voice Companion</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-6 px-2 scroll-smooth">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 italic text-sm text-center px-12">
                                <p className="mb-2">"True connection is silent, but I'm here to listen."</p>
                                <p className="text-[10px] uppercase tracking-widest font-bold">Tap the icon to start</p>
                            </div>
                        )}
                        {messages.map(m => (
                            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl shadow-xl leading-relaxed ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                                    <p className="text-sm">{m.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-6 flex gap-3 p-1 bg-gray-900 border border-gray-800 rounded-full shadow-inner focus-within:border-indigo-500/50 transition-all">
                        <input 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleManualSend()} 
                            placeholder="Type your thoughts..." 
                            className="flex-1 bg-transparent border-none rounded-full px-6 py-3 text-sm text-white focus:outline-none placeholder:text-gray-600" 
                        />
                        <button onClick={handleManualSend} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white transition-all shadow-lg active:scale-90">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConversationContainer;
