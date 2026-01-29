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
