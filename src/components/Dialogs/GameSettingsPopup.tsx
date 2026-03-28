import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { X, Settings } from "lucide-react"

import Categories from "../Categories";
import Imposters from "../Imposters";

type OnlineDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function GameSettingsPopup({ open, onOpenChange }: OnlineDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 border-4 border-purple-500/30 shadow-2xl p-0 overflow-hidden [&>button]:hidden">
                <div className="relative z-10 overflow-y-auto max-h-[90vh] p-4 sm:p-6">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <DialogTitle className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 uppercase tracking-wider drop-shadow-lg flex items-center gap-2">
                                <Settings className="text-yellow-400 animate-pulse" size={24} />
                                Game Settings
                            </DialogTitle>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="text-purple-200 hover:text-white transition-colors flex-shrink-0"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* <Players /> */}
                        <Categories />
                        <Imposters />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}