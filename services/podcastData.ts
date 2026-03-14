
import { Podcast } from "../types";

export const podcastLibrary: Podcast[] = [
    {
        id: '1',
        title: 'The Daily Boost',
        host: 'Scott Smith',
        category: 'Motivation',
        description: 'Daily motivation to help you reduce stress and find happiness.',
        imageUrl: 'https://picsum.photos/seed/dailyboost/200/200',
        link: 'https://www.dailyboostpodcast.com'
    },
    {
        id: '2',
        title: 'The Anxiety Coaches',
        host: 'Gina Ryan',
        category: 'Anxiety',
        description: 'Relaxing and inspiring show to help you overcome stress and panic.',
        imageUrl: 'https://picsum.photos/seed/anxietycoaches/200/200',
        link: 'https://www.theanxietycoachespodcast.com'
    },
    {
        id: '3',
        title: 'On Purpose',
        host: 'Jay Shetty',
        category: 'Success',
        description: 'Fascinating conversations with the most insightful people in the world.',
        imageUrl: 'https://picsum.photos/seed/onpurpose/200/200',
        link: 'https://jayshetty.me/podcast/'
    },
    {
        id: '4',
        title: 'Sleep With Me',
        host: 'Drew Ackerman',
        category: 'Sleep',
        description: 'Bedtime stories to help grown-ups fall asleep in the deep dark night.',
        imageUrl: 'https://picsum.photos/seed/sleepwithme/200/200',
        link: 'https://www.sleepwithmepodcast.com'
    },
    {
        id: '5',
        title: 'Feeling Good',
        host: 'Dr. David Burns',
        category: 'Depression',
        description: 'Powerful techniques to overcome depression and anxiety.',
        imageUrl: 'https://picsum.photos/seed/feelinggood/200/200',
        link: 'https://feelinggood.com/podcast/'
    },
    {
        id: '6',
        title: 'Relationship Advice',
        host: 'Chase Kosterlitz',
        category: 'Relationships',
        description: 'Expert advice on strengthening your relationships.',
        imageUrl: 'https://picsum.photos/seed/relationships/200/200',
        link: 'https://idopodcast.com'
    }
];

export const searchPodcastsInLibrary = (query: string): Podcast[] => {
    const q = query.toLowerCase();
    return podcastLibrary.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
}
