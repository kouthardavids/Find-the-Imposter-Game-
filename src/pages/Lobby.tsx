import { Check, Copy, User, Crown, Share2, Settings, LogOut, Play, Wifi, WifiOff, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { startGame } from "@/components/helpers/startGame";
import { supabase, broadcastReady, broadcastStartGame, broadcastGameSettings, forceCreateChannel, cleanupAllGameChannels, cleanupGameEventsChannel, type StartGamePayload, type GameSettingsPayload } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

import Imposters from "@/components/Imposters";
import Categories from "@/components/Categories";

type Player = {
    id: string;
    name: string;
    isHost: boolean;
    avatar: null | string;
    ready: boolean;
    userId: string;
}

const Lobby = () => {
    const { lobbyId } = useParams<{ lobbyId: string }>();
    const navigate = useNavigate();
    const [invitePlayers, setInvitePlayers] = useState(false);
    const [copied, setCopied] = useState(false);
    const [players, setPlayers] = useState<Player[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [currentUserId, setCurrentUserId] = useState("");
    const [currentUserReady, setCurrentUserReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
    const [error, setError] = useState("");
    const [gameSettings, setGameSettings] = useState({
        imposters: 1,
        categories: [] as string[]
    });
    const [impostersModal, setImpostersModal] = useState(false);
    const [categoriesModal, setCategoriesModal] = useState(false);

    const channelRef = useRef<RealtimeChannel | null>(null);
    const initializingRef = useRef(false);
    const heartbeatIntervalRef = useRef<number | null>(null);
    const hadPlayersRef = useRef(false);

    useEffect(() => {
        const cleanupAllOldLobbyData = () => {
            let cleanedCount = 0;

            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('lobby_') && key.endsWith('_user')) {
                    keysToRemove.push(key);
                    cleanedCount++;
                }
            }

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
        };

        cleanupAllOldLobbyData();

        if (initializingRef.current) return;

        const initializeLobby = async () => {
            initializingRef.current = true;
            setLoading(true);
            setConnectionStatus('connecting');
            setError("");

            try {
                if (!lobbyId) {
                    setError("No lobby ID provided");
                    setTimeout(() => navigate("/online"), 2000);
                    return;
                }

                cleanupGameEventsChannel();
                await cleanupAllGameChannels(lobbyId);

                await new Promise(resolve => setTimeout(resolve, 500));

                let userId = localStorage.getItem("lobbyUserId");
                let username = localStorage.getItem("lobbyUsername");
                let isHostUser = localStorage.getItem("lobbyIsHost") === "true" ||
                    localStorage.getItem("currentUserIsHost") === "true";

                if (!userId) {
                    userId = crypto.randomUUID();
                    localStorage.setItem("lobbyUserId", userId);
                }

                if (!username) {
                    username = `Player${Math.floor(Math.random() * 1000)}`;
                    localStorage.setItem("lobbyUsername", username);
                }

                setCurrentUserId(userId);
                setIsHost(isHostUser);

                const channel = forceCreateChannel(lobbyId, userId);

                channel.on('presence', { event: 'sync' }, async () => {
                    const presenceState = channel.presenceState();

                    const presenceArray = Object.values(presenceState).flat() as any[];

                    const uniquePlayersMap = new Map();

                    presenceArray.forEach(p => {
                        const existing = uniquePlayersMap.get(p.user_id);
                        if (!existing || new Date(p.joined_at) > new Date(existing.joined_at)) {
                            uniquePlayersMap.set(p.user_id, p);
                        }
                    });

                    const playersList = Array.from(uniquePlayersMap.values()).map((p: any) => ({
                        id: `${p.user_id}_${Date.now()}`,
                        name: p.username,
                        isHost: p.is_host || false,
                        avatar: p.avatar || null,
                        ready: p.ready || false,
                        userId: p.user_id,
                        joined_at: p.joined_at
                    }));

                    if (playersList.length > 0) {
                        hadPlayersRef.current = true;
                    }

                    if (playersList.length === 0 && hadPlayersRef.current) {
                        return;
                    }

                    if (playersList.length === 0) {
                        return;
                    }

                    const returningHost = localStorage.getItem("returningHost") === "true";

                    const currentPlayerInPresence = playersList.find(p => p.userId === userId);

                    if (returningHost) {
                        if (currentPlayerInPresence && !currentPlayerInPresence.isHost) {
                            console.log("Returning host detected, ensuring host status is preserved");

                            const updatedPlayersList = playersList.map(p =>
                                p.userId === userId ? { ...p, isHost: true } : p
                            );

                            const sortedPlayers = [...updatedPlayersList].sort((a, b) => {
                                if (a.userId === userId) return -1;
                                if (b.userId === userId) return 1;
                                if (a.isHost && !b.isHost) return -1;
                                if (!a.isHost && b.isHost) return 1;
                                return a.name.localeCompare(b.name);
                            });

                            setPlayers(sortedPlayers);
                            setIsHost(true);
                            localStorage.setItem("lobbyIsHost", "true");
                            localStorage.setItem("currentUserIsHost", "true");

                            localStorage.removeItem("returningHost");
                        } else {
                            const sortedPlayers = [...playersList].sort((a, b) => {
                                if (a.userId === userId) return -1;
                                if (b.userId === userId) return 1;
                                if (a.isHost && !b.isHost) return -1;
                                if (!a.isHost && b.isHost) return 1;
                                return a.name.localeCompare(b.name);
                            });

                            setPlayers(sortedPlayers);

                            if (currentPlayerInPresence) {
                                setIsHost(currentPlayerInPresence.isHost);
                                if (currentPlayerInPresence.isHost) {
                                    localStorage.setItem("lobbyIsHost", "true");
                                }
                            }

                            localStorage.removeItem("returningHost");
                        }
                    } else {
                        const hasHost = playersList.some(p => p.isHost);

                        if (!hasHost && playersList.length > 0) {

                            const sortedByJoinTime = [...playersList].sort((a, b) =>
                                new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
                            );

                            const newHost = sortedByJoinTime[0];

                            const updatedPlayersList = playersList.map(p => ({
                                ...p,
                                isHost: p.userId === newHost.userId
                            }));

                            const sortedPlayers = [...updatedPlayersList].sort((a, b) => {
                                if (a.isHost && !b.isHost) return -1;
                                if (!a.isHost && b.isHost) return 1;
                                if (a.userId === userId) return -1;
                                if (b.userId === userId) return 1;
                                return a.name.localeCompare(b.name);
                            });

                            setPlayers(sortedPlayers);

                            if (newHost.userId === userId) {
                                setIsHost(true);
                                localStorage.setItem("lobbyIsHost", "true");

                                channel.send({
                                    type: 'broadcast',
                                    event: 'host_changed',
                                    payload: {
                                        new_host_id: userId,
                                        new_host_name: newHost.name
                                    }
                                });
                            } else {
                                setIsHost(false);
                                localStorage.removeItem("lobbyIsHost");
                            }
                        } else {
                            // Normal case - just sort with host first
                            const sortedPlayers = [...playersList].sort((a, b) => {
                                if (a.isHost && !b.isHost) return -1;
                                if (!a.isHost && b.isHost) return 1;
                                if (a.userId === userId) return -1;
                                if (b.userId === userId) return 1;
                                return a.name.localeCompare(b.name);
                            });

                            setPlayers(sortedPlayers);

                            if (currentPlayerInPresence) {
                                setIsHost(currentPlayerInPresence.isHost);
                                if (currentPlayerInPresence.isHost) {
                                    localStorage.setItem("lobbyIsHost", "true");
                                } else {
                                    localStorage.removeItem("lobbyIsHost");
                                }
                            }
                        }
                    }

                    localStorage.setItem("lobbyPlayers", JSON.stringify(playersList));

                    const currentPlayerForReady = playersList.find(p => p.userId === userId);
                    if (currentPlayerForReady) {
                        setCurrentUserReady(currentPlayerForReady.ready);
                    }
                });

                channel.on('broadcast', { event: 'host_changed' }, (payload: { payload: { new_host_id: string; new_host_name: string } }) => {
                    const { new_host_id } = payload.payload;

                    setPlayers(prev => prev.map(player => ({
                        ...player,
                        isHost: player.userId === new_host_id
                    })));

                    if (new_host_id === currentUserId) {
                        setIsHost(true);
                        localStorage.setItem("lobbyIsHost", "true");
                    }
                });

                channel.on('broadcast', { event: 'start_game' }, (payload: { payload: StartGamePayload }) => {

                    const gameData = payload.payload;

                    if (gameData.chosenCategory) {
                        localStorage.setItem("chosenCategory", JSON.stringify(gameData.chosenCategory));
                    }

                    if (gameData.playersWithRoles) {
                        localStorage.setItem("playersWithRoles", JSON.stringify(gameData.playersWithRoles));
                    }

                    if (gameData.startingPlayerId !== undefined) {
                        localStorage.setItem("startingPlayerId", String(gameData.startingPlayerId));
                    }

                    if (gameData.settings) {
                        localStorage.setItem("imposters", JSON.stringify(gameData.settings.imposters));
                    }

                    navigate("/cards");
                });

                const subscriptionPromise = new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Subscription timeout'));
                    }, 20000);

                    channel.subscribe(async (status: string) => {
                        if (status === "SUBSCRIBED") {
                            clearTimeout(timeout);
                            setConnectionStatus('connected');

                            const userAvatar = localStorage.getItem("profilePic") || null;

                            const currentPresence = channel.presenceState();
                            const existingPlayers = Object.keys(currentPresence).length;
                            const shouldBeHost = existingPlayers === 0 && isHostUser;

                            await channel.track({
                                user_id: userId,
                                username: username,
                                joined_at: new Date().toISOString(),
                                ready: false,
                                is_host: shouldBeHost,
                                avatar: userAvatar
                            });

                            resolve(status);
                        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                            clearTimeout(timeout);
                            setConnectionStatus('disconnected');
                            setError("Connection failed. Please try again.");
                            reject(new Error(`Channel error: ${status}`));
                        } else if (status === "CLOSED") {
                        }
                    });
                });

                await subscriptionPromise;
                channelRef.current = channel;

                heartbeatIntervalRef.current = window.setInterval(() => {
                    if (channelRef.current && channelRef.current.state === 'joined') {
                        channelRef.current.send({
                            type: 'broadcast',
                            event: 'heartbeat',
                            payload: {
                                user_id: currentUserId,
                                timestamp: new Date().toISOString()
                            },
                        });
                    }
                }, 15000);

                const imposters = localStorage.getItem("imposters") || "1";
                const categories = localStorage.getItem("categories") || "[]";
                setGameSettings({
                    imposters: parseInt(imposters),
                    categories: JSON.parse(categories).map((c: any) => c.title)
                });

            } catch (err) {
                console.error("Error initializing lobby:", err);
                setError("Failed to connect to lobby. Please try again.");
                setConnectionStatus('disconnected');
            } finally {
                setLoading(false);
                initializingRef.current = false;
            }
        };

        initializeLobby();

        return () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
            if (channelRef.current) {
                channelRef.current.unsubscribe();
            }
        };
    }, [lobbyId, navigate]);

    const allPlayersReady = players.length > 0 && players.every(player => player.ready);

    const refreshAndBroadcastSettings = async () => {
        const imposters = localStorage.getItem("imposters") || "1";
        const categories = localStorage.getItem("categories") || "[]";
        try {
            const parsedCategories = JSON.parse(categories);
            setGameSettings({
                imposters: parseInt(imposters),
                categories: parsedCategories.map((c: any) => c.title || c)
            });

            if (channelRef.current && isHost) {
                const settingsPayload: GameSettingsPayload = {
                    imposters: parseInt(imposters),
                    categories: parsedCategories
                };
                await broadcastGameSettings(channelRef.current, settingsPayload);
            }
        } catch (e) {
            console.error("Error parsing/broadcasting categories:", e);
        }
    };

    const handleCopyCode = () => {
        if (lobbyId) {
            navigator.clipboard.writeText(lobbyId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleReadyToggle = async () => {
        if (!channelRef.current) return;

        const newReadyStatus = !currentUserReady;

        setCurrentUserReady(newReadyStatus);
        setPlayers(prev => {
            const updated = prev.map(player =>
                player.userId === currentUserId ? { ...player, ready: newReadyStatus } : player
            );
            return updated;
        });

        try {
            const username = localStorage.getItem("lobbyUsername") || "Player";
            const isHostUser = localStorage.getItem("lobbyIsHost") === "true";
            const userAvatar = localStorage.getItem("profilePic") || null;

            await channelRef.current.track({
                user_id: currentUserId,
                username: username,
                joined_at: new Date().toISOString(),
                ready: newReadyStatus,
                is_host: isHostUser,
                avatar: userAvatar
            });

        } catch (error) {
            console.error("Error updating ready status:", error);
            setCurrentUserReady(!newReadyStatus);
            setPlayers(prev => prev.map(player =>
                player.userId === currentUserId ? { ...player, ready: !newReadyStatus } : player
            ));
        }
    };

    const handleStartGame = async () => {
        if (!channelRef.current || !isHost) return;

        if (!allPlayersReady && players.length > 1) {
            return;
        }

        if (players.length < 2) {
            return;
        }

        try {
            const imposters = parseInt(localStorage.getItem("imposters") || "1");
            const categoriesString = localStorage.getItem("categories") || "[]";
            const categories = JSON.parse(categoriesString);

            if (!categories || categories.length === 0) {
                return;
            }

            const playersForGame = players.map((player, index) => ({
                id: index + 1,
                value: player.name,
                selected: true
            }));

            localStorage.setItem("players", JSON.stringify(playersForGame));

            const gameResult = startGame();

            if (!gameResult) {
                return;
            }

            const randomWord = gameResult.chosenCategory;

            const startingPlayerId = Math.floor(Math.random() * gameResult.playersWithRoles.length);

            localStorage.setItem("playersWithRoles", JSON.stringify(gameResult.playersWithRoles));
            localStorage.setItem("startingPlayerId", String(startingPlayerId));

            const gameData: StartGamePayload = {
                playersWithRoles: gameResult.playersWithRoles,
                chosenCategory: randomWord,
                startingPlayerId: startingPlayerId,
                settings: {
                    imposters,
                    categories: categories.map((c: any) => c.title || c)
                }
            };
            await broadcastStartGame(channelRef.current, gameData);

            navigate("/cards");

        } catch (error) {
            console.error("Error starting game: ", error);
        }
    };

    const handleLeaveLobby = async () => {
        if (players.length <= 1 && lobbyId) {
            try {
                const { error: updateError } = await supabase
                    .from('lobbies')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('id', lobbyId);

                if (updateError) console.error('Update status error:', updateError);

                const { error: deletePlayersError } = await supabase
                    .from('lobby_players')
                    .delete()
                    .eq('lobby_id', lobbyId);

                if (deletePlayersError) console.error('Delete players error:', deletePlayersError);

                const { error: deleteLobbyError } = await supabase
                    .from('lobbies')
                    .delete()
                    .eq('id', lobbyId);

                if (deleteLobbyError) console.error('Delete lobby error:', deleteLobbyError);

            } catch (error) {
                console.error('Failed to delete lobby:', error);
            }
        }

        if (channelRef.current) {
            channelRef.current.unsubscribe();
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }

        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('lobby_') && key.endsWith('_user')) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        localStorage.removeItem("lobbyPlayers");
        localStorage.removeItem("lobbyIsHost");
        localStorage.removeItem("currentLobbyId");
        localStorage.removeItem("currentUserId");
        localStorage.removeItem("currentUsername");
        localStorage.removeItem("currentUserIsHost");
        localStorage.removeItem("playersWithRoles");
        localStorage.removeItem("chosenCategory");
        localStorage.removeItem("categories");
        localStorage.removeItem("lobbyUserId");
        localStorage.removeItem("lobbyUsername");
        localStorage.removeItem("players");
        localStorage.removeItem("imposters");
        localStorage.removeItem("startingPlayerId");

        navigate("/online");
    };

    const handleInvitePlayers = () => {
        setInvitePlayers(true);
        if (lobbyId) {
            navigator.clipboard.writeText(lobbyId);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin h-16 w-16 text-purple-400 mx-auto mb-4" />
                    <p className="text-white text-xl font-semibold">Connecting to lobby...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="text-center bg-black/30 p-8 rounded-3xl border-2 border-red-500/30 max-w-md">
                    <AlertCircle className="text-red-400 h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-300 mb-2">Connection Error</h2>
                    <p className="text-white mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/online")}
                        className="bg-gradient-to-r from-red-600 to-orange-700 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-end mb-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-900/30 text-green-300' : connectionStatus === 'connecting' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-red-900/30 text-red-300'}`}>
                        {connectionStatus === 'connected' ? (
                            <Wifi size={16} />
                        ) : connectionStatus === 'connecting' ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                        ) : (
                            <WifiOff size={16} />
                        )}
                        <span className="text-sm font-medium">
                            {connectionStatus === 'connected' ? 'Connected' :
                                connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                <div className="text-center mb-8 mt-8">
                    <h1 className="text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 drop-shadow-2xl animate-pulse">
                        Game Lobby
                    </h1>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-400/30">
                            <p className="text-purple-300 text-sm font-medium mb-1">Room Code</p>
                            <div className="flex items-center gap-3">
                                <p className="text-white font-bold text-2xl tracking-widest">{lobbyId}</p>
                                <button
                                    onClick={handleCopyCode}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="text-xl font-semibold text-purple-200 drop-shadow-lg mt-4">
                        {players.length} player{players.length !== 1 ? 's' : ''} in lobby • {players.filter(p => p.ready).length} ready
                    </p>
                </div>

                <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 shadow-2xl border-4 border-purple-500/30 mb-6 overflow-hidden">
                    <div className="relative z-10">
                        <label className="flex items-center text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-6 uppercase tracking-widest drop-shadow-lg">
                            <User className="mr-3 text-yellow-400 animate-pulse" size={24} />
                            Players ({players.length}/10)
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {players.map((player) => (
                                <div
                                    key={player.id}
                                    className={`bg-black/30 backdrop-blur-sm rounded-xl p-4 border-2 ${player.isHost ? 'border-yellow-400/30' : 'border-purple-400/20'} flex items-center gap-4 transition-all hover:scale-105 ${player.userId === currentUserId ? 'ring-2 ring-cyan-400' : ''}`}
                                >
                                    <div className={`w-14 h-14 rounded-full border-2 shadow-lg flex items-center justify-center overflow-hidden ${player.isHost ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-gradient-to-br from-purple-600 to-pink-600'}`}>
                                        {player.avatar ? (
                                            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-white" size={28} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-bold text-lg">{player.name}</p>
                                            {player.isHost && (
                                                <div className="flex items-center gap-1 bg-yellow-400 px-2 py-1 rounded-full">
                                                    <Crown size={14} className="text-purple-900" fill="currentColor" />
                                                    <span className="text-purple-900 font-black text-xs uppercase">Host</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${player.ready ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                                            <p className={`text-sm ${player.ready ? 'text-green-300' : 'text-purple-300'}`}>
                                                {player.ready ? 'Ready' : 'Not ready'}
                                            </p>
                                            {player.userId === currentUserId && (
                                                <span className="text-cyan-300 text-xs font-medium">(You)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-purple-400/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${allPlayersReady && players.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                                    <p className="text-white font-medium">
                                        {players.length === 0 ? 'No players yet' :
                                            allPlayersReady ? 'All players ready!' :
                                                `${players.filter(p => p.ready).length}/${players.length} ready`}
                                    </p>
                                </div>
                                <button
                                    onClick={handleReadyToggle}
                                    className={`px-6 py-2 rounded-xl font-bold transition-all ${currentUserReady ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-cyan-600'}`}
                                >
                                    {currentUserReady ? '✓ Ready' : 'Mark as Ready'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-400/20 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Game Settings</h3>
                        <div className="flex items-center gap-2">
                            {isHost && (
                                <span className="text-yellow-300 text-sm font-medium">You are the host</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => isHost && setImpostersModal(true)}
                            disabled={!isHost}
                            className={`bg-purple-900/30 rounded-xl p-4 text-left transition-all ${isHost ? 'hover:bg-purple-800/40 hover:scale-105 cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
                        >
                            <p className="text-purple-300 text-sm font-medium mb-1">Imposters {isHost && <span className="text-yellow-300">(Click to edit)</span>}</p>
                            <p className="text-white font-bold text-2xl">{gameSettings.imposters}</p>
                        </button>
                        <button
                            onClick={() => isHost && setCategoriesModal(true)}
                            disabled={!isHost}
                            className={`bg-purple-900/30 rounded-xl p-4 text-left transition-all ${isHost ? 'hover:bg-purple-800/40 hover:scale-105 cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
                        >
                            <p className="text-purple-300 text-sm font-medium mb-1">Categories {isHost && <span className="text-yellow-300">(Click to edit)</span>}</p>
                            <div className="flex flex-wrap gap-2">
                                {gameSettings.categories.slice(0, 3).map((cat, index) => (
                                    <span key={index} className="bg-purple-600/50 text-white px-3 py-1 rounded-lg text-sm">
                                        {cat}
                                    </span>
                                ))}
                                {gameSettings.categories.length > 3 && (
                                    <span className="bg-purple-800/50 text-white px-3 py-1 rounded-lg text-sm">
                                        +{gameSettings.categories.length - 3} more
                                    </span>
                                )}
                                {gameSettings.categories.length === 0 && (
                                    <span className="text-purple-300/70 italic">No categories selected</span>
                                )}
                            </div>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={handleInvitePlayers}
                        className="bg-gradient-to-br from-pink-600 to-rose-700 border-4 border-pink-400/30 py-5 px-6 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 active:scale-95"
                    >
                        <Share2 size={22} />
                        Invite Friends
                    </button>
                    <button
                        onClick={handleLeaveLobby}
                        className="bg-gradient-to-br from-red-600 to-orange-700 border-4 border-red-400/30 py-5 px-6 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 shadow-xl shadow-red-500/30 hover:shadow-red-500/50 active:scale-95"
                    >
                        <LogOut size={22} />
                        Leave Lobby
                    </button>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleStartGame}
                        disabled={!isHost || !allPlayersReady || players.length < 2}
                        className={`w-full border-4 font-black py-6 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-2xl uppercase tracking-wide ${isHost && allPlayersReady && players.length >= 2 ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 border-white/30' : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 shadow-xl shadow-gray-500/20 border-gray-500/30 opacity-70 cursor-not-allowed'}`}
                    >
                        <Play size={28} fill="currentColor" />
                        {isHost ? (players.length < 2 ? 'Need More Players' : allPlayersReady ? 'Start Game' : 'Waiting for Players...') : 'Waiting for Host...'}
                    </button>
                </div>
            </div>

            {invitePlayers && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border-4 border-white/20 shadow-2xl p-6">
                        <button
                            onClick={() => setInvitePlayers(false)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white"
                        >
                            <LogOut size={26} />
                        </button>

                        <h2 className="text-center text-2xl font-black text-white mb-6">
                            Invite Friends 🎉
                        </h2>

                        <div className="mb-6">
                            <p className="text-white/80 mb-2">Share this code with friends:</p>
                            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-400/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-300 text-sm font-medium">Room Code</p>
                                        <p className="text-white font-bold text-2xl tracking-widest">{lobbyId}</p>
                                    </div>
                                    <button
                                        onClick={handleCopyCode}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl hover:opacity-90 transition-opacity"
                                    >
                                        {copied ? <Check size={22} /> : <Copy size={22} />}
                                    </button>
                                </div>
                            </div>
                            {copied && (
                                <p className="text-green-400 text-sm mt-2 text-center animate-pulse">
                                    Code copied to clipboard!
                                </p>
                            )}
                        </div>

                        <p className="text-white/70 text-sm mb-4">
                            Or share this link:
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/lobby/${lobbyId}`);
                                    alert("Invite link copied to clipboard!");
                                }}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:opacity-90 transition-opacity"
                            >
                                Copy Invite Link
                            </button>
                            <button
                                onClick={() => setInvitePlayers(false)}
                                className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {impostersModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="relative w-full max-w-md">
                        <button
                            onClick={() => {
                                setImpostersModal(false);
                                refreshAndBroadcastSettings();
                            }}
                            className="absolute -top-2 -right-2 z-10 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all"
                        >
                            <LogOut size={20} />
                        </button>
                        <Imposters />
                        <button
                            onClick={() => {
                                setImpostersModal(false);
                                refreshAndBroadcastSettings();
                            }}
                            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:opacity-90 transition-opacity"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {categoriesModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="relative w-full max-w-md">
                        <button
                            onClick={() => {
                                setCategoriesModal(false);
                                refreshAndBroadcastSettings();
                            }}
                            className="absolute -top-2 -right-2 z-10 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all"
                        >
                            <LogOut size={20} />
                        </button>
                        <Categories />
                        <button
                            onClick={() => {
                                setCategoriesModal(false);
                                refreshAndBroadcastSettings();
                            }}
                            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:opacity-90 transition-opacity"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Lobby;