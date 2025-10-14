interface PuterUser {
    id: string;
    username: string;
    email?: string;
    created_at?: string;
}

interface FSItem {
    id?: string;
    name: string;
    path: string;
    size: number;
    modified: string;
    created?: string;
    type?: 'file' | 'directory';
    mime?: string;
    url?: string;
    uid?: string;
}

interface KVItem {
    key: string;
    value: string;
}

interface Resume {
    id: string;
    title: string;
    resumePath: string;
    imagePath?: string;
    uploadedAt: string;
    feedback?: string;
    rating?: number;
}

interface AIResponse {
    success?: boolean;
    content?: string;
    message?: string;
    error?: string;
}

interface PuterChatOptions {
    model?: string;
    stream?: boolean;
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string | ChatContent[];
}

interface ChatContent {
    type: 'text' | 'file';
    text?: string;
    puter_path?: string;
}

declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        suppressHydrationWarning?: boolean;
    }
}
