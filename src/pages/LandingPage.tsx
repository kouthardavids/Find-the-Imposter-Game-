import { Play, Users, Eye, Zap, Trophy, ArrowRight, Wifi, WifiOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const inner = innerRef.current;
        if (!inner) return;

        let position = 0;
        const scrollSpeed = 1.2;
        let animationId: number;

        const scroll = () => {
            position += scrollSpeed;
            const halfWidth = inner.scrollWidth / 2;
            if (position >= halfWidth) {
                position = 0;
            }
            inner.style.transform = `translate3d(-${position}px, 0, 0)`;
            animationId = requestAnimationFrame(scroll);
        };

        animationId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationId);
    }, []);

    const videos = [
        { id: 1, url: "/videos/Download.mp4", title: "Gameplay Highlight 1" },
        { id: 2, url: "/videos/snaptik_7592762668214226197_v3.mp4", title: "Gameplay Highlight 2" },
        { id: 3, url: "/videos/ssstik.io_@itzmegeoooo0_1771009828140.mp4", title: "Gameplay Highlight 3" },
        { id: 4, url: "/videos/snaptik_7551156909022121247_v3.mp4", title: "Gameplay Highlight 4" },
    ];

    const duplicatedVideos = [...videos, ...videos];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex flex-col items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>

                <div className="absolute top-1/4 right-1/4 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-purple-500/30 animate-float" style={{ animationDelay: '0s' }}></div>
                <div className="absolute bottom-1/3 left-1/4 w-12 h-12 rounded-full border-4 border-cyan-500/30 animate-float" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/3 left-1/3 w-10 h-10 border-4 border-pink-500/30 rotate-45 animate-float" style={{ animationDelay: '0.7s' }}></div>
                <div className="absolute bottom-1/4 right-1/3 w-0 h-0 border-l-10 border-r-10 border-b-16 border-l-transparent border-r-transparent border-b-yellow-500/30 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translateY(-20px) rotate(180deg);
                        opacity: 0.6;
                    }
                }
                @keyframes colorShift {
                    0%, 100% {
                        filter: hue-rotate(0deg);
                    }
                    50% {
                        filter: hue-rotate(30deg);
                    }
                }
                @keyframes scaleRotate {
                    0%, 100% {
                        transform: scale(1) rotate(0deg);
                    }
                    50% {
                        transform: scale(1.1) rotate(5deg);
                    }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-color-shift {
                    animation: colorShift 3s ease-in-out infinite;
                }
                .animate-scale-rotate {
                    animation: scaleRotate 2s ease-in-out infinite;
                }
                .carousel-container::-webkit-scrollbar {
                    display: none;
                }
                .carousel-container {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <div className="relative z-10 max-w-5xl w-full">
                <div className="text-center mb-12">
                    <div className="relative w-64 h-48 mx-auto mb-8">
                        <div className="absolute inset-0 flex items-end justify-center">
                            <div className="relative animate-scale-rotate -mr-5" style={{ animationDelay: '0s' }}>
                                <img
                                    src="/landing/WhatsApp_Image_2026-02-13_at_20.41.46-removebg-preview.png"
                                    alt="Player 1"
                                    className="w-20 h-24 object-contain drop-shadow-lg"
                                />
                            </div>

                            <div className="relative animate-scale-rotate z-10" style={{ animationDelay: '0.3s' }}>
                                <img
                                    src="/landing/WhatsApp_Image_2026-02-13_at_20.41.46__1_-removebg-preview (1).png"
                                    alt="Player 2"
                                    className="w-30 h-28 object-contain drop-shadow-lg"
                                />
                            </div>

                            <div className="relative animate-scale-rotate -ml-5" style={{ animationDelay: '0.6s' }}>
                                <img
                                    src="/landing/WhatsApp_Image_2026-02-13_at_20.41.46__2_-removebg-preview.png"
                                    alt="Player 3"
                                    className="w-20 h-24 object-contain drop-shadow-lg"
                                />
                            </div>
                        </div>

                        <div className="absolute -top-4 -left-4 w-0 h-0 border-l-6 border-r-6 border-b-10 border-l-transparent border-r-transparent border-b-pink-500 animate-float"></div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-3 border-yellow-400 animate-float" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute -bottom-2 -left-6 w-8 h-1 bg-cyan-400 animate-float" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute -bottom-4 -right-8 w-0 h-0 border-l-5 border-r-5 border-b-8 border-l-transparent border-r-transparent border-b-purple-500 rotate-45 animate-float" style={{ animationDelay: '1.5s' }}></div>
                    </div>

                    <h1 className="text-6xl sm:text-7xl md:text-8xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl animate-color-shift" style={{ textShadow: '0 0 40px rgba(168, 85, 247, 0.4)' }}>
                        IMPOSTER
                    </h1>

                    <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 mb-2 animate-color-shift" style={{ animationDelay: '0.5s' }}>
                        GAME
                    </p>

                    <p className="text-lg text-purple-200 max-w-2xl mx-auto mb-12 opacity-90">
                        Find the imposter among you in this thrilling social deduction game!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                        <button
                            onClick={() => navigate("/offline")}
                            className="group relative bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 border-4 border-white/40 font-black px-10 py-5 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center gap-3 text-xl uppercase tracking-wide min-w-[240px] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Users size={28} className="relative z-10" />
                            <span className="relative z-10">Play Now</span>
                            <ArrowRight size={28} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        {
                            icon: Users,
                            title: "Multiplayer Fun",
                            description: "Play with 3-10 friends locally or online",
                            gradient: "from-cyan-500 to-blue-600",
                            delay: "0s"
                        },
                        {
                            icon: Eye,
                            title: "Hidden Roles",
                            description: "Secret imposters must blend in without being caught",
                            gradient: "from-purple-500 to-pink-600",
                            delay: "0.2s"
                        },
                        {
                            icon: Trophy,
                            title: "Win Together",
                            description: "Work as a team to identify the imposters",
                            gradient: "from-pink-500 to-red-600",
                            delay: "0.4s"
                        }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="relative bg-gradient-to-br from-slate-800/80 via-purple-900/50 to-slate-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-4 border-purple-500/30 overflow-hidden group hover:scale-105 hover:border-purple-400/50 transition-all duration-300"
                            style={{ animationDelay: feature.delay }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl group-hover:bg-yellow-400/20 transition-all duration-300"></div>

                            <div className="relative z-10">
                                <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border-2 border-white/30`}>
                                    <feature.icon className="text-white" size={36} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 text-center">
                                    {feature.title}
                                </h3>
                                <p className="text-purple-200 text-center">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="relative bg-gradient-to-br from-slate-800/80 via-purple-900/50 to-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-purple-500/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 animate-pulse"></div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 mb-8 text-center uppercase tracking-wider drop-shadow-lg flex items-center justify-center gap-3">
                            How to Play
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { step: "1", text: "Each player gets a secret role", color: "from-purple-400 to-purple-600" },
                                { step: "2", text: "Imposters don't know the word", color: "from-pink-400 to-pink-600" },
                                { step: "3", text: "Discuss and describe the word", color: "from-cyan-400 to-cyan-600" },
                                { step: "4", text: "Vote out who you think is the imposter", color: "from-yellow-400 to-orange-500" }
                            ].map((item, index) => (
                                <div
                                    key={item.step}
                                    className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-400/30 text-center hover:border-purple-400/60 hover:scale-105 transition-all duration-300 group"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center font-black text-3xl text-white shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border-2 border-white/40`}>
                                        {item.step}
                                    </div>
                                    <p className="text-white font-bold text-sm leading-relaxed">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;