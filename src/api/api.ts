import axios, { AxiosInstance } from "axios";
import { ChatResponse, ChatRequest } from "../types/chat/GPTMessage";
import { getConversationId } from "../utils/chat";

export function ChatAPI(): AxiosInstance {
    const options = {
        baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
        headers: {
            "Content-Type": "application/json",
        },
    };
    return axios.create(options);
}

export const getAIMessage = async (userQuery: string): Promise<ChatResponse> => {
    try {
        const conversationId = getConversationId();
        const api = ChatAPI();

        const request: ChatRequest = {
            message: userQuery,
            conversationId: conversationId,
        };
        const response = await api.post<ChatResponse>("/api/chat", request);

        return {
            role: response.data.role || "assistant",
            content: response.data.content || "Sorry, I could not process your request.",
        };
    } catch (error: unknown) {
        console.error("API Error:", error);
        const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
        const errorMessage =
            axiosError.response?.data?.error ||
            axiosError.message ||
            "Failed to get response from server";
        return {
            role: "assistant",
            content: `Sorry, I encountered an error: ${errorMessage}. Please make sure the backend server is running.`,
        };
    }
};

export interface StreamCallbacks {
    onToken: (token: string) => void;
    onDone: (fullContent: string) => void;
    onError: (error: string) => void;
}

export const streamAIMessage = async (
    userQuery: string,
    callbacks: StreamCallbacks,
    abortSignal?: AbortSignal
): Promise<void> => {
    const baseURL = process.env.REACT_APP_API_URL || "http://localhost:3001";
    const conversationId = getConversationId();

    try {
        const response = await fetch(`${baseURL}/api/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userQuery,
                conversationId: conversationId,
            }),
            signal: abortSignal,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });

            // Process SSE events in buffer
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));

                        switch (data.type) {
                            case 'token':
                                callbacks.onToken(data.content);
                                break;
                            case 'done':
                                callbacks.onDone(data.content);
                                break;
                            case 'error':
                                callbacks.onError(data.content);
                                break;
                        }
                    } catch (parseError) {
                        // Ignore parse errors for incomplete JSON
                    }
                }
            }
        }
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.log('Stream aborted by user');
            return;
        }
        console.error('Stream error:', error);
        callbacks.onError(error instanceof Error ? error.message : 'Stream failed');
    }
};

export const getProductByPartNumber = async (partNumber: string): Promise<any> => {
    try {
        const api = ChatAPI();
        const response = await api.get(`/api/debug/products`);
        // server.js returns { count, products, sample }
        const products = response.data.products || [];
        const product = products.find((p: any) => p?.partNumber?.toLowerCase?.() === partNumber.toLowerCase());

        if (product) {
            console.log(`Found product ${partNumber}:`, {
                name: product.name,
                imageUrl: product.imageUrl || 'NO IMAGE URL',
                url: product.url
            });
        } else {
            console.log(`Product ${partNumber} not found in products array`);
        }

        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
};
