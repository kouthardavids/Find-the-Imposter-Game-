import { Users, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { DialogDemo } from "@/components/Dialogs/PopupModal";

type Player = {
    id: number;
    value: string;
};

const Players = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [players, setPlayers] = useState<Player[]>([]);

    const defaultPlayers: Player[] = [
        { id: 1, value: "Player 1" },
        { id: 2, value: "Player 2" },
        { id: 3, value: "Player 3" }
    ]

    useEffect(() => {
        const storedPlayers = localStorage.getItem("players");
        if (storedPlayers) {
            try {
                const parsed = JSON.parse(storedPlayers);
                //ensuring players is an array
                if (Array.isArray(parsed)) {
                    setPlayers(parsed);
                } else {
                    setPlayers(defaultPlayers);
                    localStorage.setItem("players", JSON.stringify(defaultPlayers));
                }
            } catch (error) {
                setPlayers(defaultPlayers);
                localStorage.setItem("players", JSON.stringify(defaultPlayers));
            }
        } else {
            setPlayers(defaultPlayers);
            localStorage.setItem("players", JSON.stringify(defaultPlayers));
        }
    }, []);

    return (
        <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 shadow-2xl border-4 border-purple-500/30 mb-6 overflow-hidden">
            <div className="relative z-10">
                <label className="flex items-center text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-6 uppercase tracking-widest drop-shadow-lg ">
                    <Users className="mr-3 text-yellow-400 animate-pulse" size={24} />
                    Players
                </label>

                <div className="w-full bg-black/30 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-400/20 mb-6 min-h-[80px]">
                    <div className="flex flex-wrap gap-2">
                        {(players &&
                            players.map(player => {
                                return <div key={player.id} className="group relative bg-gradient-to-br from-purple-600/50 to-pink-600/50 backdrop-blur-sm rounded-lg px-4 py-2 border-2 border-purple-400/30 flex items-center gap-2 transition-all hover:scale-105">
                                    <span className="text-white font-bold text-sm">{player.value}</span>
                                </div>
                            }))}
                    </div>
                </div>

                <div>
                    <button
                        className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white/20 flex items-center justify-center gap-2"
                        onClick={() => setOpenDialog(true)}
                    >
                        <UserPlus size={20} />
                        Add Players
                    </button>
                </div>

                <DialogDemo
                    open={openDialog}
                    onOpenChange={setOpenDialog}
                    players={players}
                    setPlayers={setPlayers}
                />
            </div>
        </div>
    )
}

export default Players