
import React, { useState } from 'react';
import { ArrowLeftIcon, ShieldCheckIcon, BrainIcon, HeartIcon } from './icons';
import { CountryCode, AgeGroup, AIGender, AIVoicePersonality, AILanguage, Occupation, Relationship } from '../types';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfUse from './TermsOfUse';
import { CalendarIcon, ContactsIcon, NotificationIcon, LocationIcon } from './icons';
import { logoDataUri } from '../assets/logo';

interface AuthProps {
    onLoginSuccess: () => void;
}

type RegStep = 'promo' | 'auth_choice' | 'login' | 'reg_privacy' | 'reg_userInfo' | 'reg_ai_customize' | 'reg_emergency' | 'reg_occupation' | 'reg_permissions' | 'reg_terms';

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
    const [step, setStep] = useState<RegStep>('promo');
    const [formData, setFormData] = useState<any>({});
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.mobile) {
            setError('Please enter your mobile number.');
            return;
        }
        console.log('Logging in with mobile:', formData.mobile);
        localStorage.setItem('maitreya-auth', 'true');
        if (!localStorage.getItem('maitreya-ai-name')) {
             localStorage.setItem('maitreya-ai-name', 'Maitreya');
        }
        onLoginSuccess();
    };

    const nextStep = (next: RegStep) => {
        setError('');
        setStep(next);
    };

    const prevStep = (prev: RegStep) => {
        setError('');
        setStep(prev);
    };
    
    const handleRegistration = () => {
        localStorage.setItem('maitreya-auth', 'true');
        
        if (formData.aiName) {
            localStorage.setItem('maitreya-ai-name', formData.aiName);
        } else {
            localStorage.setItem('maitreya-ai-name', 'Maitreya');
        }

        // Save Voice & Gender Preferences
        if (formData.aiGender) {
            localStorage.setItem('maitreya-ai-gender', formData.aiGender);
        }
        if (formData.aiVoice) {
            localStorage.setItem('maitreya-ai-voice', formData.aiVoice);
        }

        if (formData.ageGroup === AgeGroup['51-65'] || formData.ageGroup === AgeGroup['66-85']) {
            localStorage.setItem('maitreya-scam-protection', 'true');
            localStorage.setItem('maitreya-user-age-group', formData.ageGroup);
        } else {
            localStorage.setItem('maitreya-scam-protection', 'true'); 
            localStorage.setItem('maitreya-user-age-group', formData.ageGroup);
        }

        if (formData.em_name && formData.em_phone) {
            localStorage.setItem('maitreya-emergency-contact', JSON.stringify({
                name: formData.em_name,
                phone: formData.em_phone,
                relation: formData.em_rel
            }));
        }

        onLoginSuccess();
    }
    
    // Style classes for inputs to match glassmorphism
    const inputClasses = "block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
    const selectClasses = "block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
    const labelClasses = "block text-sm font-medium text-gray-300 mb-1";

    const renderStep = () => {
        switch (step) {
            case 'promo':
                return (
                    <div className="flex flex-col items-center justify-between h-full w-full max-w-sm mx-auto animate-fade-in relative z-10 pt-10 pb-6">
                        {/* Top: Branding Label */}
                        <div className="text-center">
                            <h2 className="text-sm font-bold tracking-[0.2em] text-indigo-300 uppercase">Maitreya</h2>
                        </div>

                        {/* Middle: Main Visual & Headlines */}
                        <div className="flex flex-col items-center justify-center w-full flex-1 my-8">
                            {/* Neon Sphere Visual */}
                            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                                {/* Core Sphere */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur-xl opacity-60 animate-pulse"></div>
                                <div className="relative w-32 h-32 bg-gradient-to-b from-indigo-500 to-purple-700 rounded-full shadow-2xl flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay"></div>
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
                                </div>
                                {/* Orbiting Particles/Rings */}
                                <div className="absolute inset-0 border border-blue-500/30 rounded-full animate-spin [animation-duration:10s]"></div>
                                <div className="absolute inset-2 border border-purple-500/30 rounded-full animate-spin [animation-duration:15s] [animation-direction:reverse]"></div>
                                {/* Hovering glow */}
                                <div className="absolute -bottom-8 w-32 h-4 bg-blue-500/20 blur-xl rounded-full"></div>
                                {/* Tiny Particles */}
                                <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full animate-ping"></div>
                                <div className="absolute bottom-4 left-4 w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
                            </div>

                            <h1 className="text-3xl font-bold text-white text-center leading-tight mb-3">
                                Your Companion<br />for Life
                            </h1>
                            <p className="text-gray-300 text-center text-sm px-4 leading-relaxed font-light">
                                Smarter conversations. Safer decisions. Everyday support.
                            </p>
                        </div>

                        {/* Feature Strip */}
                        <div className="w-full space-y-5 mb-8 px-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-300">
                                    <BrainIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm">Thinks with you</h4>
                                    <p className="text-gray-400 text-xs">Intelligent, context-aware AI support</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-300">
                                    <HeartIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm">Cares for you</h4>
                                    <p className="text-gray-400 text-xs">Remembers needs, preferences & health</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-500/10 rounded-lg text-green-300">
                                    <ShieldCheckIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm">Keeps you safe</h4>
                                    <p className="text-gray-400 text-xs">Detects scams & alerts family</p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom CTA Card */}
                        <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl">
                            <button 
                                onClick={() => nextStep('auth_choice')}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02]"
                            >
                                Get Started with MAITREYA
                            </button>
                            <p className="text-center text-[10px] text-gray-500 mt-3 tracking-wide uppercase">
                                Voice-first • Always-on • Built for you
                            </p>
                        </div>
                    </div>
                );

            case 'auth_choice':
                return (
                    <div className="w-full flex flex-col items-center animate-fade-in relative z-10 pt-10">
                         <div className="flex flex-col items-center mb-10 relative">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-40 rounded-full animate-pulse"></div>
                                <img src={logoDataUri} alt="App Logo" className="w-28 h-28 relative z-10 drop-shadow-2xl" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200 tracking-[0.2em] mb-2 text-center drop-shadow-sm">
                                MAITREYA
                            </h1>
                            <p className="text-sm text-indigo-200/80 font-light tracking-widest uppercase text-center">Your Companion for Life</p>
                        </div>
                        <div className="w-full space-y-4 max-w-sm">
                            <button 
                                onClick={() => nextStep('login')} 
                                className="w-full py-4 px-6 rounded-xl shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg tracking-wide transform transition-all duration-200 hover:scale-[1.02] hover:shadow-indigo-500/25 border border-white/10"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={() => nextStep('reg_privacy')} 
                                className="w-full py-4 px-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-indigo-100 font-medium text-lg tracking-wide transition-all duration-200"
                            >
                                Create New Account
                            </button>
                            <button onClick={() => prevStep('promo')} className="w-full text-sm text-gray-500 mt-4 hover:text-gray-300 transition-colors">Back</button>
                        </div>
                         {/* Brand Footer */}
                        <div className="mt-8 pt-6 border-t border-white/5 text-center w-full">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">An Innovation from</p>
                            <p className="text-xs font-semibold text-gray-400 mt-1">VDM Business Innovations</p>
                        </div>
                    </div>
                );
            
            case 'login':
                return (
                    <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col relative z-10">
                        <button onClick={() => prevStep('auth_choice')} className="flex items-center gap-2 text-sm text-indigo-300 hover:text-white mb-6 transition-colors"><ArrowLeftIcon className="w-4 h-4" /> Back</button>
                        <h2 className="text-2xl font-bold text-white text-center mb-8">Welcome Back!</h2>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="mobile" className={labelClasses}>Mobile Number</label>
                                <div className="flex gap-2">
                                    <select name="countryCode" onChange={handleInputChange} className="w-24 px-2 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                       {Object.entries(CountryCode).map(([key, value]) => <option key={key} value={value} className="bg-gray-800">{value}</option>)}
                                    </select>
                                    <input id="mobile" name="mobile" type="tel" required onChange={handleInputChange} className={inputClasses} placeholder="9876543210" />
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-400 text-center bg-red-900/20 py-2 rounded border border-red-500/30">{error}</p>}
                            <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-white font-bold shadow-lg transition-all">Sign In</button>
                        </form>
                    </div>
                );

            case 'reg_privacy':
                return (
                     <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col relative z-10">
                         <PrivacyPolicy onAgree={() => nextStep('reg_userInfo')} onBack={() => prevStep('auth_choice')} />
                     </div>
                );

            case 'reg_userInfo':
                return (
                    <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col relative z-10">
                        <button onClick={() => prevStep('reg_privacy')} className="flex items-center gap-2 text-sm text-indigo-300 hover:text-white mb-6 transition-colors"><ArrowLeftIcon className="w-4 h-4" /> Back</button>
                        <h2 className="text-2xl font-bold text-white mb-6">About You</h2>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClasses}>Mobile Number</label>
                                <div className="flex gap-2">
                                    <select name="countryCode" onChange={handleInputChange} defaultValue={CountryCode.IN} className="w-24 px-2 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                       {Object.entries(CountryCode).map(([key, value]) => <option key={key} value={value} className="bg-gray-800">{key} ({value})</option>)}
                                    </select>
                                    <input name="mobile" type="tel" required onChange={handleInputChange} className={inputClasses} placeholder="10-digit mobile number" />
                                </div>
                            </div>
                            <div><label className={labelClasses}>Full Name</label><input name="name" type="text" required onChange={handleInputChange} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Email Address</label><input name="email" type="email" required onChange={handleInputChange} className={inputClasses} /></div>
                            <div>
                                <label className={labelClasses}>Age Group</label>
                                <select name="ageGroup" required onChange={handleInputChange} className={selectClasses}>
                                    <option value="" className="bg-gray-800">Select an age group</option>
                                    {Object.values(AgeGroup).map(age => <option key={age} value={age} className="bg-gray-800">{age}</option>)}
                                </select>
                            </div>
                            <button onClick={() => nextStep('reg_ai_customize')} className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold transition-all shadow-lg">Continue</button>
                        </div>
                    </div>
                );
            case 'reg_ai_customize':
                return (
                    <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col relative z-10">
                        <button onClick={() => prevStep('reg_userInfo')} className="flex items-center gap-2 text-sm text-indigo-300 hover:text-white mb-6 transition-colors"><ArrowLeftIcon className="w-4 h-4" /> Back</button>
                        <h2 className="text-2xl font-bold text-white mb-6">Customize Your Companion</h2>
                        <div className="space-y-4">
                            <div><label className={labelClasses}>Give Your AI a Name</label><input name="aiName" type="text" placeholder="e.g. Maitreya" required onChange={handleInputChange} className={inputClasses} /></div>
                            <div>
                                <label className={labelClasses}>Gender</label>
                                <select name="aiGender" required onChange={handleInputChange} className={selectClasses}>
                                    <option value="" className="bg-gray-800">Select gender</option>
                                    {Object.values(AIGender).map(g => <option key={g} value={g} className="bg-gray-800">{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Voice Personality</label>
                                <select name="aiVoice" required onChange={handleInputChange} className={selectClasses}>
                                    <option value="" className="bg-gray-800">Select a voice</option>
                                    {Object.values(AIVoicePersonality).map(v => <option key={v} value={v} className="bg-gray-800">{v}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className={labelClasses}>Primary Language</label>
                                <select name="aiLang" required onChange={handleInputChange} className={selectClasses}>
                                    <option value="" className="bg-gray-800">Select a language</option>
                                    {Object.values(AILanguage).map(l => <option key={l} value={l} className="bg-gray-800">{l}</option>)}
                                </select>
                            </div>
                            <button onClick={() => nextStep('reg_emergency')} className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold transition-all shadow-lg">Continue</button>
                        </div>
                    </div>
                );
            case 'reg_emergency':
                 return (
                    <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col relative z-10">
                        <button onClick={() => prevStep('reg_ai_customize')} className="flex items-center gap-2 text-sm text-indigo-300 hover:text-white mb-6 transition-colors"><ArrowLeftIcon className="w-4 h-4" /> Back</button>
                        <h2 className="text-2xl font-bold text-white mb-2">Emergency Contact</h2>
                        <p className="text-sm text-gray-400 mb-6">For your safety, the companion can notify someone if you need support or if a scam is detected.</p>
                        <div className="space-y-4">
                            <div><label className={labelClasses}>Contact Name</label><input name="em_name" type="text" required onChange={handleInputChange} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Contact Phone Number</label><input name="em_phone" type="tel" required onChange={handleInputChange} pattern="[0-9]{10}" className={inputClasses} /></div>
                            <div>
                                <label className={labelClasses}>Relationship</label>
                                <select name="em_rel" required onChange={handleInputChange} className={selectClasses}>
                                    <option value="" className="bg-gray-800">Select relationship</option>
                                    {Object.values(Relationship).map(r => <option key={r} value={r} className="bg-gray-800">{r}</option>)}
                                </select>
                            </div>
                            <button onClick={() => nextStep('reg_occupation')} className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold transition-all shadow-lg">Continue</button>
                        </div>
                    </div>
                );
            case 'reg_occupation':
                 return (
                    <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col relative z-10">
                        <button onClick={() => prevStep('reg_emergency')} className="flex items-center gap-2 text-sm text-indigo-300 hover:text-white mb-6 transition-colors"><ArrowLeftIcon className="w-4 h-4" /> Back</button>
                        <h2 className="text-2xl font-bold text-white mb-2">Your Occupation</h2>
                         <p className="text-sm text-gray-400 mb-6">This helps the companion relate to your work-life experiences.</p>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClasses}>Select Your Occupation</label>
                                <select name="occupation" required onChange={handleInputChange} className={selectClasses}>
                                    <option value="" className="bg-gray-800">Select occupation</option>
                                    {Object.values(Occupation).map(o => <option key={o} value={o} className="bg-gray-800">{o}</option>)}
                                </select>
                            </div>
                            <button onClick={() => nextStep('reg_permissions')} className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold transition-all shadow-lg">Continue</button>
                        </div>
                    </div>
                );
            case 'reg_permissions':
                const permissions = [
                    { icon: <CalendarIcon className="w-6 h-6 text-indigo-400"/>, name: "Calendar Access", reason: "For appointment reminders" },
                    { icon: <ContactsIcon className="w-6 h-6 text-indigo-400"/>, name: "Contacts Access", reason: "For emergency notifications" },
                    { icon: <NotificationIcon className="w-6 h-6 text-indigo-400"/>, name: "Notification Permission", reason: "For medication & scam alerts" },
                    { icon: <LocationIcon className="w-6 h-6 text-indigo-400"/>, name: "Location Access", reason: "For local weather & safety" },
                ];
                return (
                   <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col relative z-10">
                        <button onClick={() => prevStep('reg_occupation')} className="flex items-center gap-2 text-sm text-indigo-300 hover:text-white mb-6 transition-colors"><ArrowLeftIcon className="w-4 h-4" /> Back</button>
                        <h2 className="text-2xl font-bold text-white mb-2">App Permissions</h2>
                        <p className="text-sm text-gray-400 mb-6">Help the companion provide better care. You can change these later.</p>
                        <div className="space-y-3 my-6">
                            {permissions.map(p => (
                                <div key={p.name} className="flex items-center gap-4 bg-black/20 border border-white/5 p-3 rounded-lg">
                                    {p.icon}
                                    <div>
                                        <p className="font-medium text-gray-200 text-sm">{p.name}</p>
                                        <p className="text-xs text-gray-400">{p.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => nextStep('reg_terms')} className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold transition-all shadow-lg">Agree & Continue</button>
                    </div>
                );

            case 'reg_terms':
                return (
                     <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col relative z-10">
                        <TermsOfUse onAgree={handleRegistration} onBack={() => prevStep('reg_permissions')} />
                     </div>
                );

            default:
                return <div>Loading...</div>;
        }
    };
    
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#050508] overflow-hidden text-gray-100 p-4 font-sans selection:bg-indigo-500/30">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[80px]"></div>
            </div>

            {renderStep()}
        </div>
    );
};

export default Auth;
