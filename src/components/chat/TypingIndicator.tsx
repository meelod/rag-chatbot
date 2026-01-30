import React from "react";

const TypingIndicator = () => {
    return (
        <div className="flex items-center gap-1.5 py-1 px-1">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
            <span className="text-xs text-muted-foreground ml-1">Thinking...</span>
        </div>
    );
};

export default TypingIndicator;
