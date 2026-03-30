import { Eye, Home, RotateCcw, Loader2, Crown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { startGame } from "@/components/helpers/startGame";
import { supabase, getGameEventsChannel, broadcastPlayAgain, broadcastBackToLobby, type StartGamePayload } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Player = {
    id: number;
    value: string;
    role?: "imposter" | "player";
};

type Category = {
    name: string
};

const ImposterReveal = () => {
    const navigate = useNavigate();
    const params = useParams();

    const [imposterReveal, setImposterReveal] = useState<Player[]>([]);
    const [wordReveal, setWordReveal] = useState("");
    const [lobbyId, setLobbyId] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isOnlineGame, setIsOnlineGame] = useState(false);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const listenersSetupRef = useRef(false);

    useEffect(() => {
        // Prevent duplicate setup in React strict mode
        if (listenersSetupRef.current) return;

        const initializeLobby = async () => {
            setIsLoading(true);
            try {
                const id = params.lobbyId || localStorage.getItem("currentLobbyId");
                setLobbyId(id);

                const online = !!(params.lobbyId || localStorage.getItem("lobbyUserId"));
                setIsOnlineGame(online);

                const isHostStored = localStorage.getItem("currentUserIsHost") === "true" ||
                    localStorage.getItem("lobbyIsHost") === "true";
                setIsHost(isHostStored);

                let stored = localStorage.getItem("playersWithRoles");
                const chosenCategory = localStorage.getItem("chosenCategory");

                if (!stored && isHostStored && id) {
                    const { data, error } = await supabase
                        .from('lobbies')
                        .select('players')
                        .eq('id', id)
                        .single();
                    if (!error && data && data.players) {
                        stored = JSON.stringify(data.players);
                    }
                } else if (!stored) {
                    const lobbyPlayers = localStorage.getItem("lobbyPlayers");
                    if (lobbyPlayers) {
                        console.warn("No playersWithRoles found! Make sure to set this before navigation.");
                        stored = lobbyPlayers;
                    }
                }

                if (stored) {
                    const result: Player[] = JSON.parse(stored);
                    const foundImposters = result.filter((player) => player.role === "imposter");
                    setImposterReveal(foundImposters);
                }

                if (chosenCategory) {
                    const parsedCategory: Category = JSON.parse(chosenCategory);
                    setWordReveal(parsedCategory.name);
                }

                if (id && isHostStored) {
                    const { error } = await supabase
                        .from('lobbies')
                        .update({
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', id);

                    if (error) {
                        console.error("Error updating lobby status:", error);
                    }
                }

                if (id) {
                    const channel = getGameEventsChannel(id);

                    if (!isHostStored) {
                        channel.on('broadcast', { event: 'play_again' }, (payload: { payload: StartGamePayload }) => {
                            const gameData = payload.payload;
                            if (gameData.chosenCategory) {
                                localStorage.setItem("chosenCategory", JSON.stringify(gameData.chosenCategory));
                            }
                            if (gameData.playersWithRoles) {
                                localStorage.setItem("playersWithRoles", JSON.stringify(gameData.playersWithRoles));
                            }
                            navigate("/cards");
                        });

                        channel.on('broadcast', { event: 'back_to_lobby' }, () => {
                            if (id) {
                                navigate(`/lobby/${id}`);
                            }
                        });
                    }

                    if (channel.state !== 'joined') {
                        channel.subscribe((status: string) => {
                        });
                    }

                    channelRef.current = channel;
                    listenersSetupRef.current = true;
                }
            } catch (error) {
                console.error("Error initializing lobby:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeLobby();

        return () => {
            listenersSetupRef.current = false;
        };
    }, [params.lobbyId, navigate]);

    const handleBackToLobby = async () => {
        if (!isHost) return;
        localStorage.removeItem("playersWithRoles")

        const targetLobby = lobbyId;
        if (!targetLobby) return;

        const channel = channelRef.current;
        channelRef.current = null;

        if (channel) {
            await broadcastBackToLobby(channel);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        supabase
            .from('lobbies')
            .update({
                updated_at: new Date().toISOString()
            })
            .eq('id', targetLobby)
            .then(({ error }) => {
                if (error) console.error("Error updating lobby status:", error);
            });

        localStorage.setItem("returningHost", "true");
        localStorage.setItem("lobbyIsHost", "true");
        localStorage.setItem("currentUserIsHost", "true");

        navigate(`/lobby/${targetLobby}`);
    };

    const handleOfflinePlayAgain = () => {
        localStorage.getItem("playersWithRoles")
        const gameResult = startGame();
        if (gameResult) {
            navigate("/cards");
        }
    };

    const handleLeaveLobby = () => {
        if (lobbyId) {
            localStorage.removeItem(`lobby_${lobbyId}_user`);
        }
        localStorage.removeItem("currentLobbyId");
        localStorage.removeItem("currentUserId");
        localStorage.removeItem("currentUsername");
        localStorage.removeItem("currentUserIsHost");
        localStorage.removeItem("playersWithRoles");
        localStorage.removeItem("chosenCategory");
        localStorage.removeItem("currentCategory");
        localStorage.removeItem("lobbyPlayers");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                    <p className="text-white text-xl font-bold">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-5 flex flex-col items-center justify-center">
            <div className="text-center mb-4 sm:mb-5">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 drop-shadow-2xl animate-pulse">
                    Game Over!
                </h1>
                {lobbyId && (
                    <p className="text-purple-300 text-sm mt-2">
                        Room Code: <span className="font-mono font-bold text-yellow-300">{lobbyId}</span>
                    </p>
                )}
                {isHost && (
                    <p className="text-green-300 text-xs mt-1 flex items-center justify-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        You are the host
                    </p>
                )}
            </div>

            <div className="w-full max-w-2xl mb-4 sm:mb-5">
                <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border-2 sm:border-4 border-purple-500/30 overflow-hidden">
                    <div className="relative z-10 space-y-4 sm:space-y-5">
                        <div>
                            <label className="flex items-center justify-center text-base sm:text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-2 sm:mb-3 uppercase tracking-widest drop-shadow-lg">
                                The Word Was...
                            </label>
                            <div className="bg-black/30 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border-2 border-purple-400/20 text-center">
                                <p className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 drop-shadow-2xl animate-pulse break-words">
                                    {wordReveal || "???"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center justify-center text-base sm:text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-2 sm:mb-3 uppercase tracking-widest drop-shadow-lg">
                                The Imposter{imposterReveal.length > 1 ? 's' : ''}
                            </label>
                            <div className="space-y-2 sm:space-y-3">
                                {imposterReveal.length > 0 &&
                                    imposterReveal.map((imposter) => (
                                        <div
                                            key={imposter.id}
                                            className="bg-gradient-to-r from-red-900/50 to-orange-900/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border-2 border-red-400/30 flex justify-center shadow-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-black text-xl sm:text-2xl md:text-3xl">
                                                    {imposter.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                };
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-2xl grid gap-3 sm:gap-4">
                {isOnlineGame ? (
                    <button
                        className="bg-gradient-to-br from-slate-600 to-slate-700 border-2 sm:border-4 border-slate-400/30 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl text-white flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 shadow-xl shadow-slate-500/30 hover:shadow-slate-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                            handleLeaveLobby
                            navigate("/online")
                        }}
                        disabled={isLoading}
                        style={{
                            minHeight: '44px',
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation'
                        }}
                    >
                        <Home size={22} />
                        Back to Home
                    </button>
                ) : (
                    <button
                        className="bg-gradient-to-br from-slate-600 to-slate-700 border-2 sm:border-4 border-slate-400/30 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl text-white flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 shadow-xl shadow-slate-500/30 hover:shadow-slate-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                            handleLeaveLobby
                            navigate("/offline")
                        }}
                        disabled={isLoading}
                        style={{
                            minHeight: '44px',
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation'
                        }}
                    >
                        <Home size={22} />
                        Back to Home
                    </button>
                )}

                {!isOnlineGame && (
                    <button
                        className="bg-gradient-to-br from-green-600 to-emerald-700 border-2 sm:border-4 border-green-400/30 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl text-white flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleOfflinePlayAgain}
                        disabled={isLoading}
                        style={{
                            minHeight: '44px',
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation'
                        }}
                    >
                        <RotateCcw size={22} />
                        Play Again
                    </button>
                )}

                {isOnlineGame && isHost && (
                    <button
                        className="bg-gradient-to-br from-blue-600 to-indigo-700 border-2 sm:border-4 border-blue-400/30 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl text-white flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleBackToLobby}
                        disabled={isLoading}
                        style={{
                            minHeight: '44px',
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation'
                        }}
                    >
                        <Crown size={22} />
                        {isLoading ? "Loading..." : "Back to Lobby"}
                    </button>
                )}

                {isOnlineGame && !isHost && (
                    <div className="bg-gradient-to-br from-gray-700 to-gray-800 border-2 sm:border-4 border-gray-500/30 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl text-gray-300 flex items-center justify-center gap-2"
                        style={{
                            minHeight: '44px',
                        }}
                    >
                        <Loader2 className="animate-spin" size={22} />
                        Waiting for host...
                    </div>
                )}
            </div>

            {isOnlineGame && !isHost && lobbyId && (
                <p className="text-purple-300 text-xs mt-4 text-center max-w-xs">
                    Only the host can return to the lobby. Please wait...
                </p>
            )}

            {isOnlineGame && isHost && (
                <p className="text-green-300 text-xs mt-4 flex items-center justify-center gap-1">
                    <Crown size={14} />
                    You are the host - click to return to lobby
                </p>
            )}
        </div>
    );
};

export default ImposterReveal;