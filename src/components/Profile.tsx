import { User, Camera, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";

const Profile = () => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [username, setUsername] = useState("Player123");
    const [tempUsername, setTempUsername] = useState(username);
    const [profilePic, setProfilePic] = useState("");

    useEffect(() => {
        const savedUsername = localStorage.getItem("username");
        const savedProfilePic = localStorage.getItem("profilePic");

        if (savedUsername) {
            setUsername(savedUsername);
            setTempUsername(savedUsername);
        }

        if (savedProfilePic) {
            setProfilePic(savedProfilePic);
        }
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                setProfilePic(reader.result);
                localStorage.setItem("profilePic", reader.result);
            }
        };
        reader.readAsDataURL(file);
    };


    const handleSave = () => {
        setUsername(tempUsername);
        localStorage.setItem("username", tempUsername);
        setIsEditDialogOpen(false);
    };

    return (
        <>
            <div className="fixed top-6 right-6 z-50">
                <button
                    onClick={() => setIsEditDialogOpen(true)}
                    className="relative group"
                >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-purple-400/50 shadow-xl shadow-purple-500/30 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-110 hover:border-yellow-400 hover:shadow-yellow-400/50">
                        {profilePic ? (
                            <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-white" size={32} />
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-purple-900 group-hover:animate-bounce">
                        <Edit2 size={12} className="text-purple-900" />
                    </div>
                </button>
            </div>

            {isEditDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl border-4 border-purple-500/30 shadow-2xl overflow-hidden">
                        <div className="relative z-10 p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 uppercase tracking-wider drop-shadow-lg">
                                    Edit Profile
                                </h2>
                                <p className="text-purple-200 font-medium mt-2">
                                    Customize your player profile. This is only set temporary.
                                </p>
                            </div>

                            <div className="flex flex-col items-center mb-6">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-purple-400/50 shadow-xl flex items-center justify-center overflow-hidden">
                                        {profilePic ? (
                                            <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-white" size={64} />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform border-2 border-purple-900">
                                        <Camera size={20} className="text-purple-900" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="text-purple-300 text-sm mt-3 font-medium">Click camera to upload photo</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-yellow-300 font-bold uppercase tracking-wide text-sm mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={tempUsername}
                                    onChange={(e) => setTempUsername(e.target.value)}
                                    className="w-full bg-black/30 backdrop-blur-sm border-2 border-purple-400/30 text-white placeholder:text-purple-300/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 rounded-xl h-12 px-4 font-medium transition-all outline-none"
                                    placeholder="Enter username..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setTempUsername(username);
                                        setIsEditDialogOpen(false);
                                    }}
                                    className="flex-1 bg-gradient-to-br from-slate-600 to-slate-700 text-white border-2 border-white/10 font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 border-2 border-white/20 font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;