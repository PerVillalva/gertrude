// API configuration and utilities
import { getCSRFToken } from './django';

const API_BASE_URL = '/api';

export interface ElderSummary {
    id: number;
    elder: number;
    short_summary: string;
    long_summary: string;
    updated_at: string;
}

export interface Elder {
    id?: number;
    name: string;
    extra_details: string;
    created_at?: string;
    summary?: ElderSummary | null;
    audio?: ElderAudio | null;
}

export interface ElderAudio {
    id?: number;
    elder: number;
    audio_file: File;
    transcript?: string;
    uploaded_at?: string;
}

export interface EventInvitee {
    id: number;
    elder: number;
    elder_name: string;
}

export interface Event {
    id?: number;
    title: string;
    description: string;
    date: string; // ISO datetime string
    duration_minutes: number;
    created_by?: number | null;
    created_at?: string;
    invitees?: EventInvitee[];
}

export interface ChatMessage {
    id: number;
    sender: 'user' | 'llm';
    message: string;
    timestamp: string;
}

// Elder API functions
export const elderApi = {
    // Create a new elder
    create: async (
        elderData: Omit<Elder, 'id' | 'created_at'>
    ): Promise<Elder> => {
        const csrfToken = getCSRFToken();
        const response = await fetch(`${API_BASE_URL}/elders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(csrfToken && { 'X-CSRFToken': csrfToken }),
            },
            body: JSON.stringify(elderData),
        });

        if (!response.ok) {
            throw new Error(`Failed to create elder: ${response.statusText}`);
        }

        return response.json();
    },

    // Get all elders
    list: async (): Promise<Elder[]> => {
        const response = await fetch(`${API_BASE_URL}/elders/`);

        if (!response.ok) {
            throw new Error(`Failed to fetch elders: ${response.statusText}`);
        }

        return response.json();
    },

    // Get a specific elder
    get: async (id: number): Promise<Elder> => {
        const response = await fetch(`${API_BASE_URL}/elders/${id}/`);

        if (!response.ok) {
            throw new Error(`Failed to fetch elder: ${response.statusText}`);
        }

        return response.json();
    },

    // Upload audio for an elder
    uploadAudio: async (
        elderId: number,
        audioFile: File
    ): Promise<ElderAudio> => {
        const csrfToken = getCSRFToken();
        const formData = new FormData();
        formData.append('audio_file', audioFile);
        formData.append('elder', elderId.toString());

        const headers: Record<string, string> = {};
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }

        const response = await fetch(
            `${API_BASE_URL}/elders/${elderId}/audio/`,
            {
                method: 'POST',
                headers,
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to upload audio: ${response.statusText}`);
        }

        return response.json();
    },
};

// Event API functions
export const eventApi = {
    // Create a new event
    create: async (
        eventData: Omit<Event, 'id' | 'created_at' | 'invitees'>
    ): Promise<Event> => {
        const csrfToken = getCSRFToken();
        const response = await fetch(`${API_BASE_URL}/events/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(csrfToken && { 'X-CSRFToken': csrfToken }),
            },
            body: JSON.stringify(eventData),
        });

        if (!response.ok) {
            throw new Error(`Failed to create event: ${response.statusText}`);
        }

        return response.json();
    },

    // Get all events
    list: async (): Promise<Event[]> => {
        const response = await fetch(`${API_BASE_URL}/events/`);

        if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.statusText}`);
        }

        return response.json();
    },

    // Get a specific event
    get: async (id: number): Promise<Event> => {
        const response = await fetch(`${API_BASE_URL}/events/${id}/`);

        if (!response.ok) {
            throw new Error(`Failed to fetch event: ${response.statusText}`);
        }

        return response.json();
    },

    // Update an event
    update: async (
        id: number,
        eventData: Partial<Omit<Event, 'id' | 'created_at' | 'invitees'>>
    ): Promise<Event> => {
        const csrfToken = getCSRFToken();
        const response = await fetch(`${API_BASE_URL}/events/${id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(csrfToken && { 'X-CSRFToken': csrfToken }),
            },
            body: JSON.stringify(eventData),
        });

        if (!response.ok) {
            throw new Error(`Failed to update event: ${response.statusText}`);
        }

        return response.json();
    },

    // Delete an event
    delete: async (id: number): Promise<void> => {
        const csrfToken = getCSRFToken();
        const response = await fetch(`${API_BASE_URL}/events/${id}/`, {
            method: 'DELETE',
            headers: {
                ...(csrfToken && { 'X-CSRFToken': csrfToken }),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete event: ${response.statusText}`);
        }
    },

    // Add invitee to event
    addInvitee: async (
        eventId: number,
        elderId: number
    ): Promise<EventInvitee> => {
        const csrfToken = getCSRFToken();
        const response = await fetch(
            `${API_BASE_URL}/events/${eventId}/invitees/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken && { 'X-CSRFToken': csrfToken }),
                },
                body: JSON.stringify({ elder_id: elderId }),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to add invitee: ${response.statusText}`);
        }

        return response.json();
    },

    // Remove invitee from event
    removeInvitee: async (eventId: number, elderId: number): Promise<void> => {
        const csrfToken = getCSRFToken();
        const response = await fetch(
            `${API_BASE_URL}/events/${eventId}/invitees/${elderId}/`,
            {
                method: 'DELETE',
                headers: {
                    ...(csrfToken && { 'X-CSRFToken': csrfToken }),
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to remove invitee: ${response.statusText}`);
        }
    },
};

// Chat API functions
export const chatApi = {
    // Get event chat messages
    getEventMessages: async (eventId: number): Promise<ChatMessage[]> => {
        const response = await fetch(
            `${API_BASE_URL}/events/${eventId}/chat/messages/`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch chat messages: ${response.statusText}`
            );
        }

        return response.json();
    },

    // Send event chat message
    sendEventMessage: async (
        eventId: number,
        message: string,
        sender: 'user' | 'llm' = 'user'
    ): Promise<ChatMessage> => {
        const csrfToken = getCSRFToken();
        const response = await fetch(
            `${API_BASE_URL}/events/${eventId}/chat/messages/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken && { 'X-CSRFToken': csrfToken }),
                },
                body: JSON.stringify({
                    message,
                    sender,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.statusText}`);
        }

        return response.json();
    },

    // Get elder chat messages
    getElderMessages: async (elderId: number): Promise<ChatMessage[]> => {
        const response = await fetch(
            `${API_BASE_URL}/elders/${elderId}/chat/messages/`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch chat messages: ${response.statusText}`
            );
        }

        return response.json();
    },

    // Send elder chat message
    sendElderMessage: async (
        elderId: number,
        message: string,
        sender: 'user' | 'llm' = 'user'
    ): Promise<ChatMessage> => {
        const csrfToken = getCSRFToken();
        const response = await fetch(
            `${API_BASE_URL}/elders/${elderId}/chat/messages/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken && { 'X-CSRFToken': csrfToken }),
                },
                body: JSON.stringify({
                    message,
                    sender,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.statusText}`);
        }

        return response.json();
    },
};
