import { Zap, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameModeProps {
    currentMode: "Offline" | "Online";
}

const GameMode = ({ currentMode }: GameModeProps) => {
    const navigate = useNavigate();

    const handleModeChange = (mode: string) => {
        if (mode === "Offline") {
            localStorage.removeItem("currentLobbyId");
            localStorage.removeItem("lobbyUserId");
            localStorage.removeItem("lobbyUsername");
            localStorage.removeItem("lobbyIsHost");
            localStorage.removeItem("lobbyPlayers");
            localStorage.removeItem("currentUserId");
            localStorage.removeItem("currentUsername");
            localStorage.removeItem("currentUserIsHost");
            navigate("/offline");
        } else {
            navigate("/online");
        }
    };

    return (
        <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 shadow-2xl border-4 border-purple-500/30 mb-6 overflow-hidden">
            <div className="relative z-10">
                <label className="flex items-center text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-6 uppercase tracking-widest drop-shadow-lg">
                    <Zap className="mr-3 text-yellow-400 animate-pulse" size={24} fill="currentColor" />
                    Select Mode
                </label>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { mode: 'Offline' as const, icon: WifiOff, gradient: 'from-slate-600 to-slate-700', hoverGradient: 'from-slate-500 to-slate-600', activeGradient: 'from-orange-500 to-red-600' },
                        { mode: 'Online' as const, icon: Wifi, gradient: 'from-emerald-600 to-teal-700', hoverGradient: 'from-emerald-500 to-teal-600', activeGradient: 'from-green-400 to-emerald-600' }
                    ].map(({ mode, icon: Icon, gradient, hoverGradient, activeGradient }) => (
                        <button
                            key={mode}
                            onClick={() => handleModeChange(mode)}
                            className={`relative py-5 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${currentMode === mode
                                ? `bg-gradient-to-br ${activeGradient} text-white shadow-lg shadow-${mode === 'Online' ? 'green' : 'orange'}-500/50 border-2 border-white/30`
                                : `bg-gradient-to-br ${gradient} text-white/90 hover:bg-gradient-to-br hover:${hoverGradient} border-2 border-white/10`
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Icon size={20} className={currentMode === mode ? 'animate-bounce' : ''} />
                                <span>{mode}</span>
                            </div>

                            {currentMode === mode && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    <Zap size={14} className="text-purple-900" fill="currentColor" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GameMode