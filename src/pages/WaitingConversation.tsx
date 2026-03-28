import { Timer, Crown, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGameEventsChannel, broadcastRevealImposter } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Player = {
    id: string;
    value: string;
    startConvo?: string;
};

const WaitingConversation = () => {
    const navigate = useNavigate();
    const params = useParams();
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [startingPlayer, setStartingPlayer] = useState<Player | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [lobbyId, setLobbyId] = useState<string | null>(null);
    const [waitingForHost, setWaitingForHost] = useState(false);
    const [isOnlineGame, setIsOnlineGame] = useState(false);
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        const id = params.lobbyId || localStorage.getItem("currentLobbyId");
        setLobbyId(id);

        const online = !!(params.lobbyId || localStorage.getItem("lobbyUserId"));
        setIsOnlineGame(online);

        const isHostStored = localStorage.getItem("lobbyIsHost") === "true" ||
            localStorage.getItem("currentUserIsHost") === "true";
        setIsHost(isHostStored);

        const rolePlayers: Player[] = JSON.parse(localStorage.getItem("playersWithRoles") || "[]");

        // For online games, use the startingPlayerId from the host
        // For offline games, randomly select
        const storedStartingPlayerId = localStorage.getItem("startingPlayerId");

        if (online && storedStartingPlayerId !== null) {
            // Use the starting player determined by the host
            const startingIndex = parseInt(storedStartingPlayerId);
            setStartingPlayer(rolePlayers[startingIndex] || rolePlayers[0]);
        } else {
            // Offline mode: randomly shuffle and pick first
            const shuffledRolePlayers = [...rolePlayers];
            for (let i = shuffledRolePlayers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledRolePlayers[i], shuffledRolePlayers[j]] = [shuffledRolePlayers[j], shuffledRolePlayers[i]];
            }
            setStartingPlayer(shuffledRolePlayers[0]);
        }

        if (id && online) {
            // Use the shared game-events channel
            const channel = getGameEventsChannel(id);

            if (!isHostStored) {
                // Non-host: Listen for reveal events
                channel.on('broadcast', { event: 'reveal_imposter' }, () => {
                    navigate("/reveal");
                });
            }

            channel.subscribe((status: string) => {
            });

            channelRef.current = channel;
        }

        return () => {
        };
    }, [params.lobbyId, navigate]);

    const handleRevealImposter = async () => {
        if (isOnlineGame && isHost && lobbyId) {
            const channel = channelRef.current;

            if (channel) {
                await broadcastRevealImposter(channel);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        navigate("/reveal");
    };

    const canReveal = !isOnlineGame || isHost;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex flex-col items-center justify-center">
            <div className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 drop-shadow-2xl animate-pulse">
                    Everyone Knows Their Role!
                </h1>
                <p className="text-lg sm:text-xl font-semibold text-purple-200 drop-shadow-lg">
                    Time to start the conversation...
                </p>
            </div>

            <div className="w-full max-w-2xl mb-6">
                <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 shadow-2xl border-4 border-purple-500/30 overflow-hidden">

                    <div className="relative z-10">
                        <div className="text-center">
                            <h2 className="text-[20px] font-black text-white mb-3">
                                {startingPlayer?.value} starts the conversation
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            <button
                className={`w-full max-w-2xl font-black py-6 rounded-2xl transition-all duration-300 transform border-2 text-xl uppercase tracking-wide flex items-center justify-center gap-3 ${canReveal
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 border-white/30 hover:scale-105 cursor-pointer"
                    : "bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 border-gray-500/30 cursor-not-allowed"
                    }`}
                onClick={canReveal ? handleRevealImposter : undefined}
                disabled={!canReveal}
            >
                {canReveal ? (
                    "Reveal imposter and word"
                ) : (
                    <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={24} />
                        Waiting for host to reveal...
                    </span>
                )}
            </button>

            {isOnlineGame && !isHost && (
                <p className="text-purple-300 text-sm mt-4 text-center max-w-xs">
                    Only the host can reveal the imposter. Please wait...
                </p>
            )}

            {isOnlineGame && isHost && (
                <p className="text-green-300 text-xs mt-4 flex items-center justify-center gap-1">
                    <Crown size={14} />
                    You are the host - click to reveal when ready
                </p>
            )}

        </div>
    );
};
export default WaitingConversation;