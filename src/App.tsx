import React from "react";
import Chat from "./pages/Chat";
import ConnectionStatus from "./components/ConnectionStatus";

function App() {
    return (
        <div className="bg-slate-50 h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 shadow-md flex items-center justify-between px-4 py-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white tracking-tight">PartSelect</h1>
                        <p className="text-[10px] text-teal-100 -mt-0.5">Parts Assistant</p>
                    </div>
                </div>
                <ConnectionStatus />
            </div>
            <Chat />
        </div>
    );
};

export default App;
