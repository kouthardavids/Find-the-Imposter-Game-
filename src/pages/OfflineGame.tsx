import GameMode from "../components/GameMode";
import Players from "../components/Players";
import Categories from "../components/Categories";
import Imposters from "../components/Imposters";
import Share from "../components/ActionButtons";

const OfflineGame = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12 mt-8">
                    <h1 className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 drop-shadow-2xl animate-pulse">
                        Play Imposter Now!
                    </h1>
                    <p className="text-xl font-semibold text-purple-200 drop-shadow-lg">Find the imposter among you</p>
                </div>

                <GameMode currentMode="Offline" />
                <Players />
                <Categories />
                <Imposters />
                <Share />
            </div>
        </div>
    )
}

export default OfflineGame;
