export type Player = {
    id: string;
    name: string;
    isHost?: boolean;
    avatar?: string | null;
    isReady?: boolean;
    score?: number;
};

export type Lobby = {
    id: string;
    name: string;
    players: Player[];
    host_id: string;
    created_at: string;
    game_started: boolean;
    max_players?: number;
    settings?: {
        imposters: number;
        categories: string[];
        timeLimit?: number;
    };
};

export type LobbyMessage = {
    id: string;
    lobby_id: string;
    player_id: string;
    player_name: string;
    message: string;
    created_at: string;
};