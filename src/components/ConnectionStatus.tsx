import React, { useState, useEffect } from "react";

function ConnectionStatus() {
    const [isOnline, setIsOnline] = useState<boolean | null>(null); // null = checking

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL || "http://localhost:3001"}/api/health`,
                    { method: "GET", signal: AbortSignal.timeout(3000) }
                );
                setIsOnline(response.ok);
            } catch {
                setIsOnline(false);
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (isOnline === null) {
        return (
            <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                <span className="text-primary-foreground/70">Connecting...</span>
            </div>
        );
    }

    if (isOnline) {
        return (
            <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-primary-foreground/70">Online</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            <span className="text-red-200">Offline</span>
        </div>
    );
};

export default ConnectionStatus;
