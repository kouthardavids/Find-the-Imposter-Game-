import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, X, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

type DialogDemoProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
};

type Player = {
    id: number;
    value: string;
};

export function DialogDemo({
    open,
    onOpenChange,
    players,
    setPlayers
}: DialogDemoProps) {

    const [inputValue, setInputValue] = useState("");
    const navigate = useNavigate();

    const addPlayers = () => {
        if (!inputValue.trim()) return;

        const newPlayer: Player = {
            id: Date.now(),
            value: inputValue.trim()
        };

        setPlayers((prev) => {
            const savedPlayers = [...prev, newPlayer];
            localStorage.setItem("players", JSON.stringify(savedPlayers));
            return savedPlayers;
        });
        setInputValue("");
    };

    const removePlayer = (id: number) => {
        const updatedPlayers = players.filter((player) => player.id !== id);
        setPlayers(updatedPlayers);
        localStorage.setItem("players", JSON.stringify(updatedPlayers));

        if (updatedPlayers.length === 0) {
            localStorage.removeItem("playersWithRoles");
            navigate("/offline");
        }
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 border-4 border-purple-500/30 shadow-2xl p-0 overflow-hidden [&>button]:hidden [&>button[aria-label='Close']]:hidden">
                <div className="relative z-10 p-6">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <DialogTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 uppercase tracking-wider drop-shadow-lg flex items-center gap-2">
                                <UserPlus className="text-yellow-400 animate-pulse" size={28} />
                                Add Players
                            </DialogTitle>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="text-purple-200 hover:text-white transition-colors flex-shrink-0"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <DialogDescription className="text-purple-200 font-medium">
                            Enter the player's name to add them to the game.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 mb-6">
                        <div className="grid gap-3">
                            <Label
                                htmlFor="name"
                                className="text-yellow-300 font-bold uppercase tracking-wide text-sm"
                            >
                                Player Name
                            </Label>

                            <div className="flex flex-col">
                                <div className="flex gap-2">
                                    <Input
                                        id="name"
                                        className="flex-1 bg-black/30 backdrop-blur-sm border-2 border-purple-400/30 text-white placeholder:text-purple-300/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 rounded-xl h-12 px-4 font-medium transition-all"
                                        placeholder="Enter name..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />

                                    <button
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 border-2 border-white/20 font-bold px-4 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center"
                                        onClick={addPlayers}
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>

                                <div
                                    className="space-y-2 mt-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-purple-900/20 hover:scrollbar-thumb-purple-400/70"
                                    style={{
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: 'rgb(168 85 247 / 0.5) rgb(88 28 135 / 0.2)'
                                    }}
                                >
                                    {players.map(player => {
                                        return (
                                            <div key={player.id} className="grid grid-cols-[1fr_auto] gap-2">
                                                <div className="group relative bg-gradient-to-br from-purple-600/50 to-pink-600/50 backdrop-blur-sm rounded-lg px-4 py-2 border-2 border-purple-400/30 flex items-center gap-2 transition-all">
                                                    <span className="text-white font-bold text-sm">
                                                        {player.value}
                                                    </span>
                                                </div>

                                                <button
                                                    className="bg-gradient-to-br from-purple-600/50 to-pink-600/50 backdrop-blur-sm text-white shadow-lg border-2 border-purple-400/30 font-bold px-4 py-2 rounded-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center hover:from-purple-600/70 hover:to-pink-600/70"
                                                    onClick={() => removePlayer(player.id)}
                                                >
                                                    <X size={22} />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setPlayers([])}
                            className="flex-1 bg-gradient-to-br from-slate-600 to-slate-700 text-white border-2 border-white/10 hover:bg-gradient-to-br hover:from-slate-500 hover:to-slate-600 font-bold py-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                            Clear All
                        </Button>
                        <Button
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/20 font-bold py-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                            onClick={() => onOpenChange(false)}
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog >
    )
}