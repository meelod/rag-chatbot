import { useState, useCallback } from "react";
import { Message } from "../types/chat/GPTMessage";
import { GPTReturn } from "../types/chat/GPTReturn";
import { getAIMessage, getProductByPartNumber } from "../api/api";
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

            // Extract part numbers from assistant response and fetch product data (deduped)
            const partNumbers = Array.from(
                new Set(extractPartNumbersFromText(newMessage.content))
            );

            if (partNumbers.length > 0) {
                Promise.all(
                    partNumbers.map((partNumber) => getProductByPartNumber(partNumber))
                )
                    .then((products) => {
                        const validProducts = products
                            .filter(Boolean)
                            // De-dupe by part number to prevent repeated cards
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
                    })
                    .catch((error) => {
                        console.error("Error fetching products:", error);
                        setError("Failed to fetch product information");
                    });
            }
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
    }, []);

    const addMessage = useCallback((message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    }, []);

    const reset = useCallback(() => {
        setMessages(defaultMessage);
        setProductData(new Map());
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        messages,
        productData,
        isLoading,
        error,
        sendMessage,
        addMessage,
        reset,
    };
};
