import { Tags, Plus } from "lucide-react";
import { CategoriesSelection } from "./Dialogs/CategoriesSelection";
import { Category } from "./Dialogs/CategoriesSelection";
import { categories as allCategories } from "@/data/categories/List/categoryList";
import { useState, useEffect } from "react";

const Categories = () => {
    const [categoriesDialog, setCategoriesDialog] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<Category[]>(() => {
        try {
            const saved = localStorage.getItem("categories");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map(cat => {
                        if (cat && typeof cat === 'object') {
                            const originalCat = allCategories.find(c => c.title === cat.title);
                            return {
                                ...cat,
                                icon: originalCat?.icon || Tags
                            };
                        }
                        return cat;
                    });
                }
            }
            const defaultCategories = allCategories.slice(0, 3);
            return defaultCategories;
        } catch (error) {
            console.error("Error loading categories:", error);
            return allCategories.slice(0, 3);
        }
    });
    const [isUsingDefaults, setIsUsingDefaults] = useState(() => {
        const saved = localStorage.getItem("categories");
        return !saved || JSON.parse(saved).length === 0;
    });

    useEffect(() => {
        try {
            const categoriesToSave = selectedCategories.map(cat => {
                const originalCat = allCategories.find(c => c.title === cat.title);
                const iconName = originalCat?.icon || cat.icon?.name || "Tags";

                return {
                    title: cat.title,
                    gradient: cat.gradient,
                    data: cat.data,
                    icon: iconName
                };
            });
            localStorage.setItem("categories", JSON.stringify(categoriesToSave));
        } catch (error) {
            console.error("Error saving categories:", error);
        }
    }, [selectedCategories]);

    const displayCategories = selectedCategories.slice(0, 3);

    const handleCategoriesChange = (newCategories: Category[] | ((prev: Category[]) => Category[])) => {
        const categories = typeof newCategories === 'function' ? newCategories(selectedCategories) : newCategories;
        setSelectedCategories(categories);
        setIsUsingDefaults(false);
    };

    return (
        <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 shadow-2xl border-4 border-purple-500/30 mb-6 overflow-hidden">
            <div className="relative z-10">
                <label className="flex items-center text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-6 uppercase tracking-widest drop-shadow-lg">
                    <Tags className="mr-3 text-yellow-400 animate-pulse" size={24} />
                    Categories
                    {isUsingDefaults && (
                        <span className="ml-2 text-xs font-normal text-purple-300">(Default)</span>
                    )}
                </label>

                <div className="w-full bg-black/30 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-400/20 mb-6 min-h-[80px]">
                    <div className="flex flex-wrap gap-2">
                        {Array.isArray(displayCategories) && displayCategories.length > 0 ? (
                            displayCategories.map((cat, index) => {
                                const IconComponent = cat?.icon || Tags;
                                return (
                                    <div
                                        key={cat?.title || `cat-${index}`}
                                        className="group relative bg-gradient-to-br from-purple-600/50 to-pink-600/50 backdrop-blur-sm rounded-lg px-4 py-2 border-2 border-purple-400/30 flex items-center gap-2 transition-all hover:scale-105"
                                    >
                                        <IconComponent className="text-white" size={24} />
                                        <span className="text-white font-bold text-sm">{cat?.title || `Category ${index + 1}`}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-white/60 text-sm">No categories selected</div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setCategoriesDialog(true)}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white/20 flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    {isUsingDefaults ? "Change Categories" : "Select Category"}
                </button>

                <CategoriesSelection
                    open={categoriesDialog}
                    onOpenChange={setCategoriesDialog}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={handleCategoriesChange}
                    allCategories={Array.isArray(allCategories) ? allCategories : []}
                />
            </div>
        </div>
    );
};

export default Categories; 