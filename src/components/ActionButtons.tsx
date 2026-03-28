import { Share2, Play, X, Instagram, MessageCircle, Facebook, Music2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startGame } from "./helpers/startGame";
import GameAlert from "./GameAlert";

const ActionButtons = () => {
    const navigate = useNavigate();
    const [showShare, setShowShare] = useState(false);
    const [shareHint, setShareHint] = useState("");
    const [error, setError] = useState<string | null>(null);

    const gameUrl = window.location.origin;
    const message = "🎭 Come play this Imposter game with me!";

    const delayedOpen = (url: string, delay = 3500) => {
        setTimeout(() => {
            window.open(url, "_blank", "noopener,noreferrer");
        }, delay);
    };

    const showInlineHint = (text: string) => {
        setShareHint(text);
        setTimeout(() => setShareHint(""), 3200);
    };

    const shareWhatsapp = async () => {
        await navigator.clipboard.writeText(gameUrl);
        showInlineHint("Link copied! Paste it in WhatsApp 📋. Redirecting soon...");
        delayedOpen(`https://wa.me/?text=${encodeURIComponent(message + " " + gameUrl)}`);
    };

    const shareFacebook = async () => {
        await navigator.clipboard.writeText(gameUrl);
        showInlineHint("Link copied! Paste it in Facebook 📋");
        delayedOpen(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}`);
    };

    const shareInstagram = async () => {
        await navigator.clipboard.writeText(gameUrl);
        showInlineHint("Link copied! Paste it in Instagram DM, story, or bio 📸. Redirecting soon...");
        delayedOpen("https://www.instagram.com/");
    };

    const shareTiktok = async () => {
        await navigator.clipboard.writeText(gameUrl);
        showInlineHint("Link copied! Paste it in TikTok bio or message 🎵. Redirecting soon...");
        delayedOpen("https://www.tiktok.com/");
    };

    return (
        <>
            <GameAlert
                open={!!error}
                title="Cannot Start Game"
                message={error ?? ""}
                onClose={() => setError(null)}
            />
            <div>
                <div className="flex flex-nowrap gap-2 sm:gap-3 md:gap-4 w-full">
                    <button
                        onClick={() => setShowShare(true)}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 border-4 border-cyan-400/30 py-5 px-6 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-95"
                    >
                        <Share2 size={22} />
                        Share Game
                    </button>
                </div>

                <div className="mt-6">
                    <button
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 border-4 border-white/30 font-black py-6 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-2xl uppercase tracking-wide"

                        onClick={() => {
                            const isFirstGame = localStorage.getItem("playersWithRoles");
                            if (isFirstGame) {
                                localStorage.removeItem("startingPlayerId");
                            }

                            const game = startGame();

                            if (!game) {
                                const players = localStorage.getItem("players");
                                const categories = localStorage.getItem("categories");
                                const imposters = Number(localStorage.getItem("imposters") || 1);

                                if (!players || players === "[]") {
                                    setError("You must add at least one player before starting the game.");
                                } else if (!categories || categories === "[]") {
                                    setError("You must choose at least one category before starting the game.");
                                } else if (players && imposters >= JSON.parse(players).length) {
                                    setError("Oops! You need more players. The number of imposters cannot be equal to or more than total players.");
                                } else {
                                    setError("Cannot start game. Check your setup.");
                                }

                                return;
                            }

                            navigate("/cards");
                        }}
                    >
                        Start Game
                    </button>
                </div>
            </div >

            {showShare && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border-4 border-white/20 shadow-2xl p-6">

                        <button
                            onClick={() => setShowShare(false)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white"
                        >
                            <X size={26} />
                        </button>

                        <h2 className="text-center text-2xl font-black text-white mb-6">
                            Share the Game 🎉
                        </h2>

                        {shareHint && (
                            <p className="text-center text-sm text-white/80 mt-4 mb-5 animate-pulse">
                                {shareHint}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={shareWhatsapp}
                                className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl"
                            >
                                <MessageCircle size={20} />
                                WhatsApp
                            </button>

                            <button
                                onClick={shareFacebook}
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl"
                            >
                                <Facebook size={20} />
                                Facebook
                            </button>

                            <button
                                onClick={shareInstagram}
                                className="flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-xl"
                            >
                                <Instagram size={20} />
                                Instagram
                            </button>

                            <button
                                onClick={shareTiktok}
                                className="flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl"
                            >
                                <Music2 size={20} />
                                TikTok
                            </button>
                        </div>

                        <button
                            onClick={() => setShowShare(false)}
                            className="mt-6 w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )
            }
        </>
    );
};

export default ActionButtons;
