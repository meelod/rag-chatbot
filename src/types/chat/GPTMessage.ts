// required for chatGPT api
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
    role: MessageRole;
    content: string;
}

export interface ChatResponse {
    role: MessageRole;
    content: string;
}

export interface ChatRequest {
    message: string;
    conversationId: string;
}
