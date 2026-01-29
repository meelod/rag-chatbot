import React, { useState, useEffect, useRef } from "react";
import { useGPT } from "../hooks/useGPT";
import MessageBubble from "../components/chat/MessageBubble";
import ChatInput from "../components/chat/ChatInput";
import TypingIndicator from "../components/chat/TypingIndicator";

function Chat() {
    const [input, setInput] = useState<string>("");
    const { messages, productData, isLoading, sendMessage } = useGPT();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (): Promise<void> => {
        const userInput = input.trim();
        if (userInput !== "") {
            setInput("");
            await sendMessage(userInput);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
                {/* Welcome message if no messages */}
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-teal-50 rounded-2xl flex items-center justify-center shadow-sm">
                            <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-slate-700 mb-1">Hi, how can I help?</h2>
                        <p className="text-sm text-slate-500">Ask about refrigerator or dishwasher parts</p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <MessageBubble
                        key={index}
                        message={message}
                        index={index}
                        productData={productData}
                    />
                ))}

                {isLoading && (
                    <div className="flex flex-col max-w-[88%] my-2 items-start">
                        <div className="py-2 px-3 rounded-2xl rounded-bl-md bg-white text-slate-700 border border-slate-200 shadow-sm">
                            <TypingIndicator />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <ChatInput
                input={input}
                onInputChange={setInput}
                onSend={handleSend}
                disabled={!input.trim()}
                isLoading={isLoading}
            />
        </div>
    );
};

export default Chat;
