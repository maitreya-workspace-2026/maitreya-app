
import React, { useState, useRef } from 'react';
import { ShieldCheckIcon, ArrowLeftIcon } from './icons';

interface PrivacyPolicyProps {
    onAgree: () => void;
    onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onAgree, onBack }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 5) { // 5px buffer
                setIsScrolled(true);
            }
        }
    };

    return (
        <div className="w-full">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-indigo-400 hover:underline mb-4"><ArrowLeftIcon className="w-4 h-4" /> Back to Home</button>
            <div className="flex flex-col items-center mb-4">
                <ShieldCheckIcon className="w-10 h-10 text-indigo-400 mb-2" />
                <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
                <p className="text-sm text-gray-400">Last updated: 26th September 2025</p>
            </div>
            
            <div ref={scrollRef} onScroll={handleScroll} className="h-64 overflow-y-auto p-4 bg-gray-900/50 rounded-md border border-gray-700 text-sm text-gray-300 space-y-3 prose prose-invert prose-sm">
                <p>Maitreya: Companion for Life (“we,” “us,” or “our”) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our mobile application (the “App”) in compliance with the General Data Protection Regulation (GDPR).</p>
                
                <h4 className="font-bold">1. Data Controller</h4>
                <p>Maitreya: Companion for Life<br/>VDM Business Innovations<br/>235, 2ND FLOOR, 13TH CROSS, BINNAMANGALA 2ND STAGE, INDIRANAGAR, BANGALORE, 560038<br/>Email: support@maitreya.org.in</p>
                
                <h4 className="font-bold">2. Information We Collect</h4>
                <ul className="list-disc list-inside">
                    <li>Personal Data: Name, email address, registration details.</li>
                    <li>User Content: Voice notes, journal entries, preferences.</li>
                    <li>Device Information: Device model, OS version, app usage data, IP address.</li>
                    <li>Usage Data: Interaction data, crash reports, performance data.</li>
                </ul>
                
                <h4 className="font-bold">3. Legal Basis for Processing</h4>
                <ul className="list-disc list-inside">
                    <li>Consent: For collecting and processing voice notes and personal data.</li>
                    <li>Legitimate Interests: For app improvement, security, and communication.</li>
                    <li>Contractual Necessity: To provide the services you request.</li>
                </ul>

                <h4 className="font-bold">4. Purpose of Data Processing</h4>
                <ul className="list-disc list-inside">
                    <li>To provide core app functionality and personalized experiences.</li>
                    <li>To communicate important updates, respond to inquiries.</li>
                    <li>To analyze and improve the app's performance and security.</li>
                </ul>

                <h4 className="font-bold">5. Data Sharing and Disclosure</h4>
                <ul className="list-disc list-inside">
                    <li>We do not sell or rent user data.</li>
                    <li>Data may be shared with trusted service providers under strict confidentiality agreements.</li>
                    <li>We may disclose data where legally required or to protect our rights.</li>
                </ul>

                <h4 className="font-bold">6. Data Transfers</h4>
                <p>If personal data is transferred outside the European Economic Area (EEA), appropriate safeguards such as Standard Contractual Clauses are used.</p>

                <h4 className="font-bold">7. Data Retention</h4>
                <p>We retain personal data only for as long as necessary to fulfill the purposes outlined or comply with legal obligations.</p>

                <h4 className="font-bold">8. Your Rights Under GDPR</h4>
                <p>You have the right to access, rectify, erase, restrict, object to processing, and data portability. You may withdraw consent at any time and lodge complaints with a supervisory authority.</p>

                <h4 className="font-bold">9. Security Measures</h4>
                <p>We implement technical and organizational security measures to protect your data, including encryption and access controls.</p>

                <h4 className="font-bold">10. Children's Privacy</h4>
                <p>The App is not intended for users under 13. We do not knowingly collect data from children under 13.</p>
                
                <h4 className="font-bold">11. Changes to this Policy</h4>
                <p>We may update this policy from time to time. Significant updates will be communicated via the App.</p>

                <h4 className="font-bold">12. Contact</h4>
                <p>For privacy questions or requests, contact: support@maitreya.org.in</p>
            </div>

            <div className="mt-4 space-y-4">
                 <label className="flex items-center text-sm text-gray-300">
                    <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} disabled={!isScrolled} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 disabled:opacity-50" />
                    <span className="ml-2">I have read and agree to the Privacy Policy.</span>
                </label>
                <button onClick={onAgree} disabled={!isScrolled || !isChecked} className="w-full py-3 bg-indigo-600 rounded-md text-white font-medium disabled:bg-gray-600 disabled:cursor-not-allowed">
                    Agree & Continue
                </button>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
