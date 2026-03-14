
import { FunctionDeclaration, Type } from "@google/genai";
import { Reminder, ImportantDate } from "../types";
import { searchPodcastsInLibrary } from "./podcastData";

const REMINDERS_KEY = 'maitreya-reminders';
const IMPORTANT_DATES_KEY = 'maitreya-important-dates';
const PERMISSIONS_KEY = 'maitreya-permissions';
const EMERGENCY_CONTACT_KEY = 'maitreya-emergency-contact';
const USER_INTERESTS_KEY = 'maitreya-user-interests';

export type PermissionType = 'calendar' | 'contacts' | 'messages' | 'email' | 'location' | 'cabs';

const notifyDataChange = () => {
    window.dispatchEvent(new CustomEvent('maitreya-data-update'));
};

// --- Interest Management ---
export const saveUserInterest = (interest: string, category: string) => {
    try {
        const interests = JSON.parse(localStorage.getItem(USER_INTERESTS_KEY) || '[]');
        interests.push({ interest, category, timestamp: Date.now() });
        localStorage.setItem(USER_INTERESTS_KEY, JSON.stringify(interests.slice(-20))); // Keep last 20
        notifyDataChange();
        return { success: true, message: `I'll remember that you like ${interest}.` };
    } catch (e) {
        return { success: false, error: "Storage error" };
    }
};

export const getPermissions = (): Record<PermissionType, boolean> => {
    const defaultPermissions: Record<PermissionType, boolean> = {
        calendar: false, contacts: false, messages: false, email: false, location: false, cabs: false,
    };
    try {
        const stored = localStorage.getItem(PERMISSIONS_KEY);
        return stored ? { ...defaultPermissions, ...JSON.parse(stored) } : defaultPermissions;
    } catch {
        return defaultPermissions;
    }
};

export const updatePermission = (permission: PermissionType, value: boolean) => {
    const perms = getPermissions();
    perms[permission] = value;
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(perms));
    notifyDataChange();
};

export const checkPermission = (permission: PermissionType): boolean => {
    return getPermissions()[permission];
};

export const setReminder = (title: string, time: string, category: 'Personal' | 'Professional') => {
    try {
        const existingReminders: Reminder[] = JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]');
        const newReminder: Reminder = { id: Date.now(), iconName: category === 'Professional' ? 'Briefcase' : 'Heart', title, time, done: false, category };
        localStorage.setItem(REMINDERS_KEY, JSON.stringify([...existingReminders, newReminder]));
        notifyDataChange();
        return { success: true, message: `Reminder set.` };
    } catch (error) {
        return { success: false, message: 'Internal Storage Error.' };
    }
};

export const addImportantDate = (date: string, event: string, reason: string, isRecurring: boolean = true) => {
    try {
        const existingDates: ImportantDate[] = JSON.parse(localStorage.getItem(IMPORTANT_DATES_KEY) || '[]');
        const newDate: ImportantDate = { id: Date.now(), date, event, reason, isRecurring };
        localStorage.setItem(IMPORTANT_DATES_KEY, JSON.stringify([...existingDates, newDate]));
        notifyDataChange();
        return { success: true, message: `Saved ${event}.` };
    } catch (error) {
        return { success: false, message: 'Internal Storage Error.' };
    }
};

export const triggerScamAlert = (scamType: string, severity: 'medium' | 'high') => {
    const contactStr = localStorage.getItem(EMERGENCY_CONTACT_KEY);
    let contactInfo = null;
    if (contactStr) { try { contactInfo = JSON.parse(contactStr); } catch (e) {} }
    return { success: true, alertTriggered: true, scamType, severity, contactInfo };
};

// --- Declarations ---
export const saveUserInterestDeclaration: FunctionDeclaration = {
    name: "saveUserInterest",
    description: "Saves a topic, hobby, or item the user mentions as a favorite. Use this to personalize future conversations.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            interest: { type: Type.STRING, description: "The specific interest (e.g. Dhoni, Filter Coffee)." },
            category: { type: Type.STRING, description: "Hobby, Food, Person, Sport, etc." }
        },
        required: ["interest", "category"],
    },
};

export const availableTools = [
    saveUserInterestDeclaration,
    {
        name: "setReminder",
        description: "Sets a reminder. Always ask if it is 'Personal' or 'Professional'.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                time: { type: Type.STRING },
                category: { type: Type.STRING, enum: ['Personal', 'Professional'] }
            },
            required: ["title", "time", "category"],
        },
    },
    {
        name: "addImportantDate",
        description: "Saves a significant date (Birthday, etc.). Proactive 24hr alerts will be generated.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                date: { type: Type.STRING },
                event: { type: Type.STRING },
                reason: { type: Type.STRING },
                isRecurring: { type: Type.BOOLEAN }
            },
            required: ["date", "event", "reason"],
        },
    },
    {
        name: "triggerScamAlert",
        description: "Triggers a security alert for suspected scams.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                scamType: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['medium', 'high'] }
            },
            required: ["scamType", "severity"],
        },
    }
];
