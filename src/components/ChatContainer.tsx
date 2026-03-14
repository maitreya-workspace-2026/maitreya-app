

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, GroundingChunk } from '../types';
import * as geminiService from '../services/geminiService';
import { PaperclipIcon, SendIcon, SearchIcon, MapIcon } from './icons';
import { logoDataUri } from '../assets/logo';

interface ChatContainerProps {
    // This component is not actively used but is being fixed.
    // The `mode` prop and related logic have been removed to fix compilation errors.
}

const ChatContainer: React.FC<ChatContainerProps> = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMessages([]);
        setInput('');
        setImageFile(null);
        setImagePreview(null);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSend = useCallback(async () => {
        if ((input.trim() === '' && !imageFile) || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input, image: imagePreview ?? undefined };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        const currentImageFile = imageFile;
        setInput('');
        setImageFile(null);
        setImagePreview(null);
        setIsLoading(true);

        try {
            const position = await new Promise<GeolocationPosition | null>((resolve) => {
                navigator.geolocation.getCurrentPosition(resolve, () => resolve(null));
            });
            const location = position ? { latitude: position.coords.latitude, longitude: position.coords.longitude } : null;

            const response = await geminiService.generateUnifiedResponse(currentInput, currentImageFile, location);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: response.text,
                grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined,
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: "I'm sorry, I encountered an error. Please try again.",
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, imageFile, imagePreview]);

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-bold text-white mb-4">Chat</h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'bot' && <img src={logoDataUri} alt="bot avatar" className="w-8 h-8 rounded-full" />}
                        <div className={`max-w-lg p-3 rounded-xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                            {msg.image && <img src={msg.image} alt="user upload" className="rounded-lg mb-2 max-h-40" />}
                            <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                            {msg.grounding && msg.grounding.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-600">
                                    <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
                                        <SearchIcon className="w-4 h-4" />
                                        <span>Sources from the web</span>
                                    </h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {msg.grounding.map((chunk, index) => {
                                            const url = chunk.web?.uri || chunk.maps?.uri;
                                            const title = chunk.web?.title || chunk.maps?.title || url;
                                            if (!url) return null;
                                            return (
                                                <a
                                                    key={index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 max-w-full bg-gray-800 hover:bg-gray-600/70 p-2 rounded-lg text-xs text-indigo-300 transition-colors"
                                                >
                                                    {chunk.maps ? <MapIcon className="w-4 h-4 flex-shrink-0" /> : <SearchIcon className="w-4 h-4 flex-shrink-0" />}
                                                    <span className="truncate">{title}</span>
                                                </a>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                         {msg.sender === 'user' && <img src="https://picsum.photos/id/1005/40/40" alt="user avatar" className="w-8 h-8 rounded-full" />}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                         <img src={logoDataUri} alt="bot avatar" className="w-8 h-8 rounded-full" />
                         <div className="max-w-lg p-3 rounded-xl bg-gray-700 text-gray-200 rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <SearchIcon className="w-4 h-4 text-indigo-400 animate-pulse" />
                                <p className="text-sm text-gray-300">Searching for the latest information...</p>
                            </div>
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
                {imagePreview && (
                    <div className="relative w-20 h-20 mb-2">
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-lg"/>
                        <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">X</button>
                    </div>
                )}
                <div className="flex items-center bg-gray-700/50 rounded-lg p-1.5">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white cursor-pointer" aria-label="Attach file">
                        <PaperclipIcon className="w-5 h-5" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-transparent focus:outline-none px-2 text-white text-sm"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || (!input.trim() && !imageFile)} className="p-2 bg-indigo-600 rounded-md text-white disabled:bg-gray-500">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatContainer;