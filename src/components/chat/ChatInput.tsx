import React from "react";
import { ChatInputProps } from "../../types/chat/ChatComponents";

const ChatInput = ({
    input,
    onInputChange,
    onSend,
    disabled = false,
    isLoading = false,
    placeholder = "Ask about refrigerator or dishwasher parts...",
}: ChatInputProps) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter" && !e.shiftKey) {
            onSend();
            e.preventDefault();
        }
    };

    return (
        <div className="p-3 flex-shrink-0 border-t border-slate-200 bg-white">
            <div className="flex gap-2 items-center">
                <input
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed transition-all placeholder:text-slate-400"
                />
                <button
                    className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white cursor-pointer hover:from-teal-600 hover:to-teal-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    onClick={onSend}
                    disabled={disabled || isLoading}
                    aria-label="Send message"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ChatInput;
