import React from "react";
import { MessageBubbleProps } from "../../types/chat/ChatComponents";
import MessageContent from "./MessageContent";

const MessageBubble = ({ message, index, productData }: MessageBubbleProps) => {
    const isUser = message.role === "user";

    return (
        <div
            className={`flex flex-col max-w-[88%] my-2 ${isUser ? "self-end items-end ml-auto" : "items-start"
                }`}
        >
            {message.content && (
                <div
                    className={`py-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser
                            ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-br-md"
                            : "bg-white text-slate-700 rounded-bl-md border border-slate-200"
                        }`}
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
