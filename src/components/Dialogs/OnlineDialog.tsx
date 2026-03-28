import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, LogIn, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export function OnlineDialog() {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleCreateRoom = async () => {
        setIsLoading(true)
        setError("")

        try {
            const lobbyId = generateLobbyId();
            const userId = generateUserId();
            const username = localStorage.getItem("username") || `Player${Math.floor(Math.random() * 1000)}`;
            const avatar = localStorage.getItem("profilePic") || null;

            const { data: lobbyData, error: supabaseError } = await supabase
                .from('lobbies')
                .insert([
                    {
                        id: lobbyId,
                        host_id: userId,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }
                ])
                .select();

            if (supabaseError) throw supabaseError;

            const { data: playerData, error: playerError } = await supabase
                .from('lobby_players')
                .insert([
                    {
                        lobby_id: lobbyId,
                        user_id: userId,
                        username: username,
                        is_host: true,
                        joined_at: new Date().toISOString()
                    }
                ])
                .select();

            if (playerError) throw playerError;

            localStorage.removeItem("currentLobbyId");
            localStorage.removeItem("currentUserId");
            localStorage.removeItem("currentUsername");
            localStorage.removeItem("currentUserIsHost");
            localStorage.removeItem("playersWithRoles");
            localStorage.removeItem("chosenCategory");
            localStorage.removeItem("lobbyPlayers");
            localStorage.removeItem("lobbyIsHost");
            localStorage.removeItem("lobbyUserId");
            localStorage.removeItem("lobbyUsername");

            localStorage.setItem("currentLobbyId", lobbyId);
            localStorage.setItem("currentUserId", userId);
            localStorage.setItem("currentUsername", username);
            localStorage.setItem("currentUserIsHost", "true");
            localStorage.setItem("lobbyIsHost", "true");
            localStorage.setItem("lobbyUserId", userId);
            localStorage.setItem("lobbyUsername", username);

            const initialPlayers = [{
                id: userId,
                value: username,
                isHost: true,
                avatar: avatar
            }];
            localStorage.setItem("lobbyPlayers", JSON.stringify(initialPlayers));

            localStorage.setItem(`lobby_${lobbyId}_user`, JSON.stringify({
                userId,
                username,
                isHost: true,
                avatar
            }));

            navigate(`/lobby/${lobbyId}`);
        } catch (error) {
            console.error("Error creating lobby:", error)
            setError("Failed to create lobby. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleJoinRoom = async () => {
        if (!roomCode.trim()) {
            setError("Please enter a room code")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const lobbyId = roomCode.trim().toUpperCase();

            const { data: lobby, error: lobbyError } = await supabase
                .from('lobbies')
                .select('*')
                .eq('id', lobbyId)
                .single();

            if (lobbyError || !lobby) {
                setError("Lobby not found. Please check the code.");
                return;
            }

            const storedUserData = localStorage.getItem(`lobby_${lobbyId}_user`);
            let userData;
            let userId;

            if (storedUserData) {
                userData = JSON.parse(storedUserData);
                userId = userData.userId;

                const { data: existingPlayer } = await supabase
                    .from('lobby_players')
                    .select('*')
                    .eq('lobby_id', lobbyId)
                    .eq('user_id', userId)
                    .single();

                if (!existingPlayer) {
                    const { error: playerError } = await supabase
                        .from('lobby_players')
                        .insert([
                            {
                                lobby_id: lobbyId,
                                user_id: userId,
                                username: userData.username,
                                is_host: false,
                                joined_at: new Date().toISOString()
                            }
                        ]);

                    if (playerError) throw playerError;
                }
            } else {
                userId = generateUserId();
                const username = localStorage.getItem("username") || `Player${Math.floor(Math.random() * 1000)}`;
                const avatar = localStorage.getItem("profilePic") || null;

                const { error: playerError } = await supabase
                    .from('lobby_players')
                    .insert([
                        {
                            lobby_id: lobbyId,
                            user_id: userId,
                            username: username,
                            is_host: false,
                            joined_at: new Date().toISOString()
                        }
                    ]);

                if (playerError) throw playerError;

                userData = { userId, username, isHost: false, avatar };
                localStorage.setItem(`lobby_${lobbyId}_user`, JSON.stringify(userData));
            }

            localStorage.removeItem("currentLobbyId");
            localStorage.removeItem("currentUserId");
            localStorage.removeItem("currentUsername");
            localStorage.removeItem("currentUserIsHost");
            localStorage.removeItem("playersWithRoles");
            localStorage.removeItem("chosenCategory");
            localStorage.removeItem("lobbyIsHost");
            localStorage.removeItem("lobbyUserId");
            localStorage.removeItem("lobbyUsername");

            localStorage.setItem("currentLobbyId", lobbyId);
            localStorage.setItem("currentUserId", userData.userId);
            localStorage.setItem("currentUsername", userData.username);
            localStorage.setItem("currentUserIsHost", userData.isHost.toString());
            localStorage.setItem("lobbyIsHost", userData.isHost.toString());
            localStorage.setItem("lobbyUserId", userData.userId);
            localStorage.setItem("lobbyUsername", userData.username);

            navigate(`/lobby/${lobbyId}`);
        } catch (error) {
            console.error("Error joining lobby:", error)
            setError("Failed to join lobby. Please check the code and try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const generateLobbyId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    const generateUserId = () => {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    const formContent = (
        <div className="grid gap-6">
            <div className="grid gap-3">
                <Label
                    htmlFor="code"
                    className="text-yellow-300 font-bold uppercase tracking-wide text-sm"
                >
                    Room Code
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="code"
                        placeholder="Enter 6-digit code"
                        value={roomCode}
                        onChange={(e) => {
                            const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                            setRoomCode(value);
                        }}
                        className="flex-1 bg-black/30 backdrop-blur-sm border-2 border-purple-400/30 text-white placeholder:text-purple-300/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 rounded-xl h-12 px-4 font-medium transition-all uppercase text-center tracking-widest text-lg"
                        maxLength={6}
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleJoinRoom}
                        disabled={isLoading || roomCode.length !== 6}
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/20 font-bold px-6 py-[21px] rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Joining..." : (
                            <>
                                <LogIn size={18} />
                                Join
                            </>
                        )}
                    </Button>
                </div>
                <p className="text-purple-300 text-xs mt-1">
                    Enter 6 uppercase letters or numbers
                </p>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-purple-400/30"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 px-4 text-purple-200 font-bold uppercase text-sm tracking-wider">
                        Or
                    </span>
                </div>
            </div>

            <Button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 border-2 border-white/20 font-bold py-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Creating..." : (
                    <>
                        <Plus size={20} />
                        Create a Room
                    </>
                )}
            </Button>

            <div className="text-center">
                <p className="text-purple-300 text-sm">
                    Share the room code with friends to play together!
                </p>
            </div>
        </div>
    );

    return (
        <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 shadow-2xl border-4 border-purple-500/30 overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Users className="text-yellow-400 animate-pulse" size={28} />
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 uppercase tracking-wider drop-shadow-lg">
                        Online Lobby
                    </h3>
                </div>
                <p className="text-purple-200 font-medium mb-6">
                    Enter a code to join the fun, or create a room to play!
                </p>
                {formContent}
            </div>
        </div>
    )
}