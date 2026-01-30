import React, { useState, useEffect, useRef } from "react";
import { useGPT } from "../hooks/useGPT";
import MessageBubble from "../components/chat/MessageBubble";
import ChatInput from "../components/chat/ChatInput";
import TypingIndicator from "../components/chat/TypingIndicator";
import StreamingText from "../components/ui/StreamingText";
import { cn } from "../lib/utils";

function Chat() {
    const [input, setInput] = useState<string>("");
    const [useStreaming, setUseStreaming] = useState<boolean>(true);
    const {
        messages,
        productData,
        isLoading,
        isStreaming,
        streamingContent,
        sendMessage,
        sendMessageStreaming,
        cancelStream,
    } = useGPT();

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
    }, [messages, isLoading, isStreaming, streamingContent]);

    const handleSend = async (): Promise<void> => {
        const userInput = input.trim();
        if (userInput !== "") {
            setInput("");
            if (useStreaming) {
                await sendMessageStreaming(userInput);
            } else {
                await sendMessage(userInput);
            }
        }
    };

    const isProcessing = isLoading || isStreaming;

    return (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/20 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
                {/* Welcome message if no messages */}
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 rounded-2xl flex items-center justify-center shadow-sm border border-primary/10">
                            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-foreground mb-1">Hi, how can I help?</h2>
                        <p className="text-sm text-muted-foreground">Ask about refrigerator or dishwasher parts</p>
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

                {/* Streaming content */}
                {isStreaming && streamingContent && (
                    <div className="flex flex-col max-w-[88%] my-2 items-start animate-fade-in">
                        <div className="py-3 px-4 rounded-2xl rounded-bl-md bg-card text-card-foreground border border-border shadow-sm text-sm leading-relaxed">
                            <StreamingText content={streamingContent} showCursor={true} />
                        </div>
                    </div>
                )}

                {/* Loading indicator (non-streaming) */}
                {isLoading && !isStreaming && (
                    <div className="flex flex-col max-w-[88%] my-2 items-start">
                        <div className="py-2 px-3 rounded-2xl rounded-bl-md bg-card text-card-foreground border border-border shadow-sm">
                            <TypingIndicator />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Cancel streaming button */}
            {isStreaming && (
                <div className="px-3 pb-2 flex justify-center">
                    <button
                        onClick={cancelStream}
                        className="px-3 py-1.5 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Stop generating
                    </button>
                </div>
            )}

            <ChatInput
                input={input}
                onInputChange={setInput}
                onSend={handleSend}
                disabled={!input.trim()}
                isLoading={isProcessing}
            />

            {/* Response mode toggle */}
            <div className="px-4 pb-3 flex justify-center">
                <div className="inline-flex items-center gap-1 p-1 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border/50">
                    <button
                        onClick={() => setUseStreaming(true)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            useStreaming
                                ? "bg-card dark:bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        title="See words appear as they're generated"
                    >
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Streaming
                        </span>
                    </button>
                    <button
                        onClick={() => setUseStreaming(false)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            !useStreaming
                                ? "bg-card dark:bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Wait for complete response"
                    >
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Standard
                        </span>
                    </button>
                </div>
            </div>

            {/* Mode description */}
            <div className="px-4 pb-2 text-center">
                <p className="text-[10px] text-muted-foreground/70">
                    {useStreaming
                        ? "Streaming: See words as they're generated in real-time"
                        : "Standard: Wait for the complete response before displaying"}
                </p>
            </div>
        </div>
    );
};

export default Chat;
