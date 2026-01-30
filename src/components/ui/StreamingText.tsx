import React from "react";
import { cn } from "../../lib/utils";

interface StreamingTextProps {
    content: string;
    className?: string;
    showCursor?: boolean;
}

/**
 * StreamingText component displays text with an animated cursor
 * for live typing effect during streaming responses.
 */
export function StreamingText({ content, className, showCursor = true }: StreamingTextProps) {
    return (
        <span className={cn("inline", className)}>
            {content}
            {showCursor && (
                <span
                    className="inline-block w-2 h-4 ml-0.5 bg-current animate-pulse align-text-bottom"
                    style={{
                        animation: "cursor-blink 1s ease-in-out infinite",
                    }}
                    aria-hidden="true"
                />
            )}
        </span>
    );
}

export default StreamingText;
