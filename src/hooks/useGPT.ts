import { useState, useCallback, useRef } from "react";
import { Message } from "../types/chat/GPTMessage";
import { GPTReturn } from "../types/chat/GPTReturn";
import { getAIMessage, getProductByPartNumber, streamAIMessage } from "../api/api";
import { extractPartNumbersFromText } from "../utils/productExtractor";

const defaultMessage: Message[] = [
    {
        role: "assistant",
        content: "Hi, how can I help you today?",
    },
];

export const useGPT = (initialMessages?: Message[]): GPTReturn => {
    const [messages, setMessages] = useState<Message[]>(initialMessages || defaultMessage);
    const [productData, setProductData] = useState<Map<number, any>>(new Map());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Streaming state
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [streamingContent, setStreamingContent] = useState<string>("");
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchProductsForMessage = useCallback(async (content: string, assistantIndex: number) => {
        const partNumbers = Array.from(
            new Set(extractPartNumbersFromText(content))
        );

        if (partNumbers.length > 0) {
            try {
                const products = await Promise.all(
                    partNumbers.map((partNumber) => getProductByPartNumber(partNumber))
                );
                const validProducts = products
                    .filter(Boolean)
                    .filter(
                        (p: any, idx: number, arr: any[]) =>
                            idx === arr.findIndex((x) => x?.partNumber === p?.partNumber)
                    );

                if (validProducts.length > 0) {
                    setProductData((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(assistantIndex, validProducts);
                        return newMap;
                    });
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        }
    }, []);

    const sendMessage = useCallback(async (userInput: string): Promise<void> => {
        if (userInput.trim() === "") {
            return;
        }

        setError(null);
        setIsLoading(true);

        // Set user message and capture assistant index
        let assistantIndex = 0;
        setMessages((prevMessages) => {
            assistantIndex = prevMessages.length + 1; // Index where assistant message will be
            return [...prevMessages, { role: "user", content: userInput }];
        });

        try {
            // Call API & set assistant message
            const newMessage = await getAIMessage(userInput);

            setMessages((prevMessages) => [...prevMessages, newMessage]);

            // Extract part numbers and fetch product data
            await fetchProductsForMessage(newMessage.content, assistantIndex);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            setError(errorMessage);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    role: "assistant",
                    content: "Sorry, I encountered an error processing your request. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [fetchProductsForMessage]);

    const sendMessageStreaming = useCallback(async (userInput: string): Promise<void> => {
        if (userInput.trim() === "") {
            return;
        }

        setError(null);
        setIsStreaming(true);
        setStreamingContent("");

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        // Set user message and capture assistant index
        let assistantIndex = 0;
        setMessages((prevMessages) => {
            assistantIndex = prevMessages.length + 1;
            return [...prevMessages, { role: "user", content: userInput }];
        });

        let fullContent = "";

        try {
            await streamAIMessage(
                userInput,
                {
                    onToken: (token) => {
                        fullContent += token;
                        setStreamingContent(fullContent);
                    },
                    onDone: async (content) => {
                        // Add final message to state
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            { role: "assistant", content: content },
                        ]);

                        // Clear streaming state
                        setStreamingContent("");
                        setIsStreaming(false);

                        // Fetch products for the final content
                        await fetchProductsForMessage(content, assistantIndex);
                    },
                    onError: (errorMsg) => {
                        setError(errorMsg);
                        setIsStreaming(false);
                        setStreamingContent("");
                    },
                },
                abortControllerRef.current.signal
            );
        } catch (error) {
            console.error("Error in streaming:", error);
            setError(error instanceof Error ? error.message : "Streaming failed");
            setIsStreaming(false);
            setStreamingContent("");
        }
    }, [fetchProductsForMessage]);

    const cancelStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsStreaming(false);
        setStreamingContent("");
    }, []);

    const addMessage = useCallback((message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    }, []);

    const reset = useCallback(() => {
        setMessages(defaultMessage);
        setProductData(new Map());
        setError(null);
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingContent("");
        cancelStream();
    }, [cancelStream]);

    return {
        messages,
        productData,
        isLoading,
        error,
        sendMessage,
        addMessage,
        reset,
        // Streaming additions
        isStreaming,
        streamingContent,
        sendMessageStreaming,
        cancelStream,
    };
};
