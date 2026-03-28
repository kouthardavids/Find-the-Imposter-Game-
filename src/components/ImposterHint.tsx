// import { useState, useEffect } from "react";

// const ImposterHint = () => {
//     const [imposterHint, setImposterHint] = useState<boolean>(() => {
//         try {
//             const savedImposterHint = localStorage.getItem("imposterHint");
//             if (savedImposterHint !== null) {
//                 const parsed = JSON.parse(savedImposterHint);
//                 if (typeof parsed === 'boolean') {
//                     return parsed;
//                 }
//             }
//         } catch (error) {
//             console.error("Error loading imposter hint:", error);
//         }
//         return false;
//     });

//     useEffect(() => {
//         localStorage.setItem("imposterHint", JSON.stringify(imposterHint));
//     }, [imposterHint]);

//     return (
//         <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 shadow-2xl border-4 border-purple-500/30 mb-6 overflow-hidden">
//             <div className="relative z-10">
//                 <label className="flex items-center justify-between cursor-pointer">
//                     <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 uppercase tracking-widest drop-shadow-lg">
//                         Imposter Hint
//                     </span>
//                     <button
//                         onClick={() => setImposterHint(!imposterHint)}
//                         className={`relative w-16 h-8 rounded-full transition-all duration-300 ${imposterHint ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/50' : 'bg-slate-600'
//                             }`}
//                     >
//                         <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${imposterHint ? 'translate-x-8' : 'translate-x-0'
//                             }`}></div>
//                     </button>
//                 </label>
//             </div>
//         </div>
//     )
// }

// export default ImposterHint