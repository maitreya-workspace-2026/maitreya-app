
import React, { useState } from 'react';
import { podcastLibrary } from '../services/podcastData';
import { Podcast } from '../types';
import { SearchIcon, HeadphonesIcon, PlayIcon } from './icons';

const Podcasts: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('All');

    const categories = ['All', 'Motivation', 'Anxiety', 'Depression', 'Sleep', 'Success', 'Relationships'];

    const filteredPodcasts = podcastLibrary.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col h-full p-4 md:p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <HeadphonesIcon className="w-8 h-8 text-purple-400"/>
                Inspiration Library
            </h2>
            <p className="text-gray-400 mb-6">Curated podcasts to help you find balance, motivation, and peace.</p>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search podcasts..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                filterCategory === cat 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 overflow-y-auto">
                {filteredPodcasts.map(podcast => (
                    <div key={podcast.id} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all hover:shadow-lg group">
                        <div className="relative h-40 bg-gray-700">
                            <img src={podcast.imageUrl} alt={podcast.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white font-medium backdrop-blur-sm">
                                {podcast.category}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-white mb-1">{podcast.title}</h3>
                            <p className="text-sm text-purple-400 mb-2">Hosted by {podcast.host}</p>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{podcast.description}</p>
                            
                            <a 
                                href={podcast.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg transition-all font-medium text-sm"
                            >
                                <PlayIcon className="w-4 h-4" /> Listen Now
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Podcasts;
