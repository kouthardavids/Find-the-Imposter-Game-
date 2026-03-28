import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Zap, List, X } from "lucide-react";

export type Category = {
    title: string;
    icon: any;
    gradient: string;
    data?: any[];
};

type CategoriesSelectionProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCategories: Category[];
    setSelectedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    allCategories: Category[];
};

export function CategoriesSelection({
    open,
    onOpenChange,
    selectedCategories,
    setSelectedCategories,
    allCategories,
}: CategoriesSelectionProps) {
    const toggleCategory = (cat: Category) => {
        if (cat.title === "All Categories") {
            setSelectedCategories(
                selectedCategories.some(c => c.title === "All Categories") ? [] : [cat]
            );
        } else {
            setSelectedCategories(prev => {
                const exists = prev.find(c => c.title === cat.title);
                const withoutAll = prev.filter(c => c.title !== "All Categories");
                return exists ? withoutAll.filter(c => c.title !== cat.title) : [...withoutAll, cat];
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 border-4 border-purple-500/30 shadow-2xl p-0 overflow-hidden [&>button]:hidden">
                <div className="relative z-10 overflow-y-auto max-h-[90vh] p-4 sm:p-6">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <DialogTitle className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 uppercase tracking-wider drop-shadow-lg flex items-center gap-2">
                                <List className="text-yellow-400 animate-pulse" size={24} />
                                Select a category below
                            </DialogTitle>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="text-purple-200 hover:text-white transition-colors flex-shrink-0"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {allCategories.map(cat => {
                                const isSelected = selectedCategories.some(c => c.title === cat.title);
                                const Icon = cat.icon;

                                return (
                                    <button
                                        key={cat.title}
                                        onClick={() => toggleCategory(cat)}
                                        className={`relative bg-black/30 backdrop-blur-sm rounded-xl p-4 border-2 transition-all duration-300 flex items-center gap-3 group hover:scale-105 active:scale-95 ${isSelected
                                            ? "border-yellow-400 shadow-lg shadow-yellow-400/30"
                                            : "border-purple-400/20 hover:border-purple-400/40"
                                            }`}
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}
                                        >
                                            <Icon className="text-white" size={24} />
                                        </div>
                                        <span className="text-white font-bold text-left text-sm sm:text-base">{cat.title}</span>

                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                                <Zap size={14} className="text-purple-900" fill="currentColor" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </DialogHeader>

                    <DialogFooter className="gap-3 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 bg-gradient-to-br from-slate-600 to-slate-700 text-white border-2 border-white/10 hover:bg-gradient-to-br hover:from-slate-500 hover:to-slate-600 font-bold py-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 border-2 border-white/20 font-bold py-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                            onClick={() => onOpenChange(false)}
                        >
                            Save Category
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
