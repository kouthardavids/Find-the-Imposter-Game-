import { useState, useEffect } from "react"
import { Eye } from "lucide-react";

const Imposters = () => {
    const [imposters, setImposters] = useState<number>(() => {
        try {
            const savedImposters = localStorage.getItem("imposters");
            if (savedImposters !== null) {
                const parsed = JSON.parse(savedImposters);
                //make sure it's a valid number
                const numberValue = Number(parsed);
                if (!isNaN(numberValue) && numberValue >= 0) {
                    return numberValue;
                }
            }
        } catch (error) {
            console.error("Error loading imposters count:", error);
        }
        return 1;
    });

    useEffect(() => {
        localStorage.setItem("imposters", JSON.stringify(imposters));
    }, [imposters]);

    return (
        <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 shadow-2xl border-4 border-purple-500/30 mb-6 overflow-hidden">
            <div className="relative z-10">
                <label className="flex items-center text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-6 uppercase tracking-widest drop-shadow-lg">
                    <Eye className="mr-3 text-yellow-400 animate-pulse" size={24} />
                    Imposters
                </label>

                <div className="w-full bg-black/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-400/20">
                    <input
                        type="range"
                        min="1"
                        max="3"
                        value={imposters}
                        onChange={(e) => setImposters(Number(e.target.value))}
                        className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                            background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(219, 39, 119) ${((imposters - 1) / 2) * 100}%, rgb(71, 85, 105) ${((imposters - 1) / 2) * 100}%, rgb(71, 85, 105) 100%)`
                        }}
                    />
                    <div className="flex justify-between text-sm font-bold text-purple-300 mt-4">
                        {[1, 2, 3].map(num => (
                            <span
                                key={num}
                                className={`transition-all ${imposters === num ? 'text-yellow-400 scale-125' : ''}`}
                            >
                                {num}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
                    border: 3px solid white;
                }
                .slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
                    border: 3px solid white;
                }
            `}</style>
        </div>
    )
}

export default Imposters