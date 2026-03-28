import { X, AlertTriangle } from "lucide-react";

type GameAlertProps = {
    open: boolean;
    title?: string;
    message: string;
    onClose: () => void;
};

const GameAlert = ({ open, title = "Action Required", message, onClose }: GameAlertProps) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl border-4 border-purple-400/30 shadow-2xl p-6 animate-scale-in">

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white"
                >
                    <X size={24} />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl animate-pulse">
                    <AlertTriangle className="text-black" size={32} />
                </div>

                {/* Text */}
                <h2 className="text-center text-2xl font-black text-white mb-2">
                    {title}
                </h2>

                <p className="text-center text-purple-200 font-semibold mb-6">
                    {message}
                </p>

                {/* Action */}
                <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black py-3 rounded-xl hover:scale-105 active:scale-95 transition-all"
                >
                    Got it
                </button>
            </div>
        </div>
    );
};

export default GameAlert;