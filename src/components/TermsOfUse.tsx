
import React, { useState, useRef } from 'react';
import { ShieldCheckIcon, ArrowLeftIcon } from './icons';

interface TermsOfUseProps {
    onAgree: () => void;
    onBack: () => void;
}

const TermsOfUse: React.FC<TermsOfUseProps> = ({ onAgree, onBack }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 5) {
                setIsScrolled(true);
            }
        }
    };

    return (
        <div className="w-full">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-indigo-400 hover:underline mb-4"><ArrowLeftIcon className="w-4 h-4" /> Back</button>
            <div className="flex flex-col items-center mb-4">
                <ShieldCheckIcon className="w-10 h-10 text-indigo-400 mb-2" />
                <h2 className="text-2xl font-bold text-white">Terms of Use</h2>
                <p className="text-sm text-gray-400">Last updated: 26th September 2025</p>
            </div>
            
            <div ref={scrollRef} onScroll={handleScroll} className="h-64 overflow-y-auto p-4 bg-gray-900/50 rounded-md border border-gray-700 text-sm text-gray-300 space-y-3 prose prose-invert prose-sm">
                <p>Welcome to Maitreya Companion for Life (“App”), provided by VDM Business Innovations. By using our app, you agree to the following terms:</p>
                
                <h4 className="font-bold">Use of the App:</h4>
                <ul className="list-disc list-inside">
                    <li>You must be 15 years or older to use the app.</li>
                    <li>You agree not to misuse the app or interfere with its operation.</li>
                    <li>You retain ownership of all content you create but grant us a license to store and display it within the app.</li>
                </ul>
                
                <h4 className="font-bold">User Responsibilities:</h4>
                <ul className="list-disc list-inside">
                    <li>Provide accurate information during registration.</li>
                    <li>Maintain confidentiality of your account credentials.</li>
                    <li>Use the app in compliance with applicable laws.</li>
                </ul>

                <h4 className="font-bold">Intellectual Property:</h4>
                <ul className="list-disc list-inside">
                    <li>All app content, design, and software are owned by us or our licensors.</li>
                    <li>You may not copy, modify, or distribute app content without permission.</li>
                </ul>

                <h4 className="font-bold">Limitation of Liability:</h4>
                <ul className="list-disc list-inside">
                    <li>The app is provided “as is” without warranties.</li>
                    <li>We are not liable for any damages from your use of or inability to use the app.</li>
                </ul>

                <h4 className="font-bold">Termination:</h4>
                <p>We may suspend or terminate accounts for violations of these terms or inactivity.</p>

                <h4 className="font-bold">Changes to Terms:</h4>
                <p>We may update these terms; continued use constitutes acceptance.</p>

                <h4 className="font-bold">Governing Law:</h4>
                <p>These terms are governed by the laws of Karnataka, India.</p>

                <h4 className="font-bold">Contact:</h4>
                <p>For questions about terms, contact support@maitreya.org.in</p>
            </div>

            <div className="mt-4 space-y-4">
                 <label className="flex items-center text-sm text-gray-300">
                    <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} disabled={!isScrolled} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 disabled:opacity-50" />
                    <span className="ml-2">I have read and agree to the Terms of Use.</span>
                </label>
                <button onClick={onAgree} disabled={!isScrolled || !isChecked} className="w-full py-3 bg-indigo-600 rounded-md text-white font-medium disabled:bg-gray-600 disabled:cursor-not-allowed">
                    Finish Registration
                </button>
            </div>
        </div>
    );
};

export default TermsOfUse;
