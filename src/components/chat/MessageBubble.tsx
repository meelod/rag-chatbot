import React from "react";
import { MessageBubbleProps } from "../../types/chat/ChatComponents";
import MessageContent from "./MessageContent";
import { cn } from "../../lib/utils";

const MessageBubble = ({ message, index, productData }: MessageBubbleProps) => {
    const isUser = message.role === "user";

    return (
        <div
            className={cn(
                "flex flex-col max-w-[88%] my-2",
                isUser ? "self-end items-end ml-auto" : "items-start"
            )}
        >
            {message.content && (
                <div
                    className={cn(
                        "py-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                        isUser
                            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md"
                            : "bg-card text-card-foreground rounded-bl-md border border-border"
                    )}
                >
                    <MessageContent
                        content={message.content}
                        messageIndex={index}
                        isUser={isUser}
                        productData={productData}
                    />
                </div>
            )}
        </div>
    );
};

export default MessageBubble;
