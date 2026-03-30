import { Eye, EyeOff, Users, Pointer } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resultCategory } from "@/components/helpers/startGame";

type Player = {
    id: number;
    value: string;
    role?: "imposter" | "player";
    word?: string;
};

type ImposterRevealProps = {
    players?: Player[];
    onComplete?: () => void;
};

const ImposterCards = ({ players: propPlayers, onComplete }: ImposterRevealProps) => {
    const navigate = useNavigate();
    const params = useParams();
    const [isRevealing, setIsRevealing] = useState(false);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentWord, setCurrentWord] = useState<any>(null);
    const [isOnlineGame, setIsOnlineGame] = useState(false);
    const [currentUserPlayer, setCurrentUserPlayer] = useState<Player | null>(null);

    useEffect(() => {
        const online = !!(params.lobbyId || localStorage.getItem("lobbyUserId"));
        setIsOnlineGame(online);

        let loadedPlayers: Player[] = [];
        const storedPlayers = localStorage.getItem("playersWithRoles");
        if (storedPlayers) {
            const parsed = JSON.parse(storedPlayers);
            if (Array.isArray(parsed)) {
                loadedPlayers = parsed;
            }
        } else if (propPlayers && Array.isArray(propPlayers)) {
            loadedPlayers = propPlayers;
        }
        setPlayers(loadedPlayers);

        if (online) {
            const username = localStorage.getItem("lobbyUsername");
            if (username && loadedPlayers.length > 0) {
                const userPlayer = loadedPlayers.find(p => p.value === username);
                setCurrentUserPlayer(userPlayer || null);
            }
        }
    }, [propPlayers, params.lobbyId]);

    useEffect(() => {
        const storedWord = localStorage.getItem("chosenCategory");
        if (storedWord) {
            setCurrentWord(JSON.parse(storedWord));
        } else {
            const word = resultCategory();
            setCurrentWord(word);
        }
    }, []);

    const currentPlayer = isOnlineGame ? currentUserPlayer : players[currentPlayerIndex];
    const isLastPlayer = isOnlineGame ? true : currentPlayerIndex === players.length - 1;

    const handleNextPlayer = () => {
        if (isOnlineGame) {
            onComplete?.();
            navigate("/waiting");
        } else {
            if (currentPlayerIndex + 1 < players.length) {
                setCurrentPlayerIndex(currentPlayerIndex + 1);
            } else {
                onComplete?.();
                navigate("/waiting");
            }
        }
    };

    const handleBackToSetup = () => {
        localStorage.removeItem("playersWithRoles")
        navigate("/offline");
    };

    const handleRevealStart = (e: any) => {
        e.preventDefault();
        setIsRevealing(true);
    };

    const handleRevealEnd = (e: any) => {
        e.preventDefault();
        setIsRevealing(false);
    };

    const handleContextMenu = (e: any) => {
        e.preventDefault();
    };

    if (!currentPlayer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl text-center p-4">
                    {isOnlineGame ? "Could not find your player data. Please rejoin the lobby." : "No players to reveal."}
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-4 flex flex-col items-center justify-center"
            style={{
                minHeight: '100dvh',
                width: '100%',
                overflow: 'hidden',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
            }}
        >
            <div
                className="text-center mb-2 sm:mb-3 px-2"
                style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                }}
            >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 drop-shadow-2xl">
                    Role Reveal
                </h1>
            </div>

            <div
                className="relative w-full mb-3 sm:mb-4 px-2"
                style={{
                    maxWidth: '500px',
                    perspective: '1500px'
                }}
            >
                <div
                    className="relative w-full"
                    style={{
                        aspectRatio: '3/4',
                        maxHeight: 'calc(100vh - 180px)',
                        // maxHeight: 'calc(100dvh - 180px)',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                    }}
                    onMouseDown={handleRevealStart}
                    onMouseUp={handleRevealEnd}
                    onMouseLeave={handleRevealEnd}
                    onTouchStart={handleRevealStart}
                    onTouchEnd={handleRevealEnd}
                    onTouchCancel={handleRevealEnd}
                    onContextMenu={handleContextMenu}
                >
                    <div
                        className="relative w-full h-full transition-transform duration-500"
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: isRevealing ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            WebkitTransformStyle: 'preserve-3d',
                            transformOrigin: 'center center',
                            WebkitTransformOrigin: 'center center',
                        }}
                    >
                        <div
                            className="absolute w-full h-full"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(0deg)',
                                WebkitTransform: 'rotateY(0deg)',
                                zIndex: isRevealing ? 1 : 2,
                                visibility: isRevealing ? 'hidden' : 'visible',
                                opacity: isRevealing ? 0 : 1,
                                pointerEvents: isRevealing ? 'none' : 'auto',
                            }}
                        >
                            <div className="relative w-full h-full bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-purple-500/30 overflow-hidden flex flex-col items-center justify-center p-4 sm:p-5 cursor-pointer select-none">
                                <div className="relative z-10 text-center w-full">
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 sm:mb-3 px-2 break-words">
                                        {currentPlayer.value}
                                    </h2>
                                    <p className="text-purple-200 font-semibold text-base sm:text-lg px-2">
                                        Do not reveal your word to others!
                                    </p>
                                    <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-yellow-400 animate-bounce">
                                        <Pointer size={window.innerWidth < 640 ? 18 : 20} />
                                        <span className="font-bold text-base sm:text-lg">Hold to reveal</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className="absolute w-full h-full"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                WebkitTransform: 'rotateY(180deg)',
                                zIndex: isRevealing ? 2 : 1,
                                visibility: isRevealing ? 'visible' : 'hidden',
                                opacity: isRevealing ? 1 : 0,
                                pointerEvents: isRevealing ? 'auto' : 'none',
                            }}
                        >
                            <div
                                className={`relative w-full h-full rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 overflow-hidden flex flex-col items-center justify-center p-4 sm:p-5 ${currentPlayer.role === "imposter"
                                    ? "bg-gradient-to-br from-red-900 via-orange-900 to-red-900 border-red-500/50"
                                    : "bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 border-green-500/50"
                                    }`}
                            >
                                <div className="relative z-10 text-center w-full">
                                    {currentPlayer.role === "imposter" ? (
                                        <>
                                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 sm:mb-3 drop-shadow-lg">
                                                YOU ARE
                                            </h2>
                                            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-3 sm:mb-4 drop-shadow-2xl animate-pulse px-2">
                                                IMPOSTER
                                            </div>
                                            <p className="text-red-200 font-bold text-base sm:text-lg md:text-xl px-2">
                                                Blend in and don't get caught!
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 drop-shadow-lg">
                                                THE WORD IS
                                            </h2>
                                            <div className="bg-black/30 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 sm:py-4 border-2 border-green-400/30 mb-3 sm:mb-4 text-center mx-2">
                                                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 drop-shadow-2xl leading-tight break-words">
                                                    {currentWord?.name || 'Loading...'}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-nowrap gap-2 sm:gap-3 w-full px-2" style={{ maxWidth: '500px' }}>
                {!isOnlineGame && (
                    <button
                        onClick={handleBackToSetup}
                        className="flex-1 min-w-0 bg-gradient-to-r from-gray-600 to-slate-700 text-white py-3 rounded-xl sm:rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-base sm:text-lg truncate"
                        style={{
                            minHeight: '44px',
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation'
                        }}
                    >
                        <span className="truncate">Back to Setup</span>
                    </button>
                )}
                <button
                    onClick={handleNextPlayer}
                    disabled={isRevealing}
                    className={`flex-1 min-w-0 font-black py-3 rounded-xl sm:rounded-2xl transition-all duration-300 transform border-2 sm:border-4 text-base sm:text-lg uppercase tracking-wide flex items-center justify-center truncate ${isRevealing
                        ? "bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 border-white/30 hover:scale-105 active:scale-95"
                        }`}
                    style={{
                        minHeight: '44px',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation'
                    }}
                >
                    <span className="truncate">
                        {isOnlineGame ? "I've Seen My Role" : (isLastPlayer ? "Start Game" : "Next Player")}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ImposterCards;