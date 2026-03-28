import { categories } from "@/data/categories/List/categoryList";

type Player = {
    id: number;
    value: string;
    selected?: boolean;
    role?: "imposter" | "player";
};

type Category = {
    title: string;
    icon: any;
    gradient: string;
    data?: any[];
    selected?: boolean;
};

const selectRandomPlayers = (playersArray: Player[], imposterCount: number): Player[] => {
    const shuffled = [...playersArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selectImposter = shuffled.slice(0, imposterCount).map(p => p.id);

    return playersArray.map(player => ({
        ...player,
        role: selectImposter.includes(player.id) ? "imposter" : "player",
    }));
};

const selectRandomCategory = (selectedCategories: Category[], categoriesList: Category[]) => {
    const selectedTitles = selectedCategories.map((cat) => cat.title);
    const matchedCategories = categoriesList.filter((cat) => selectedTitles.includes(cat.title));
    const allData = matchedCategories.flatMap(cat => cat.data || []);

    if (allData.length === 0) {
        return { name: "No words available", category: "Error" };
    }

    const shuffled = [...allData];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled[0];
};

export const resultCategory = () => {
    try {
        const chosenCategoryString = localStorage.getItem("categories");

        if (!chosenCategoryString || chosenCategoryString === "[]") {
            return null;
        }

        const chosenCategory: Category[] = JSON.parse(chosenCategoryString);

        if (chosenCategory.length === 0) {
            return null;
        }

        return selectRandomCategory(chosenCategory, categories);
    } catch (error) {
        console.error("Error in resultCategory:", error);
        return null;
    }
};

export const startGame = () => {
    const playerFromLocalString = localStorage.getItem("players");
    const getImposters = Number(localStorage.getItem("imposters") || 1);

    if (!playerFromLocalString) {
        return null;
    }

    let playerFromLocal: Player[] = [];
    try {
        playerFromLocal = JSON.parse(playerFromLocalString);
        if (!Array.isArray(playerFromLocal) || playerFromLocal.length === 0) {
            return null;
        }
    } catch {

        return null;
    }

    if (getImposters >= playerFromLocal.length) {
        return null;
    }

    const selectedWord = resultCategory();

    if (!selectedWord) {
        return null;
    }

    const playersWithRoles = selectRandomPlayers(playerFromLocal, getImposters);

    localStorage.setItem("playersWithRoles", JSON.stringify(playersWithRoles));
    localStorage.setItem("chosenCategory", JSON.stringify(selectedWord));

    return {
        playersWithRoles,
        chosenCategory: selectedWord
    };
};