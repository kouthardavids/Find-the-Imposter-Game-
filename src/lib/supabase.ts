import { createClient, RealtimeChannel } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


export const supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-key",
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        },
        global: {
            headers: {
                'Content-Type': 'application/json',
            }
        },
        realtime: {
            params: {
                eventsPerSecond: 10,
            },
            timeout: 30000,
        },
    }
);

export type StartGamePayload = {
    playersWithRoles: any[];
    chosenCategory: any;
    startingPlayerId: number;
    settings: {
        imposters: number;
        categories: string[];
    };
};

const activeChannels = new Map<string, RealtimeChannel>();

let gameEventsChannel: RealtimeChannel | null = null;
let gameEventsLobbyId: string | null = null;

export const getGameEventsChannel = (lobbyId: string): RealtimeChannel => {
    const cleanLobbyId = lobbyId.replace(/[^a-zA-Z0-9_-]/g, '');

    if (gameEventsChannel && gameEventsLobbyId === cleanLobbyId && gameEventsChannel.state === 'joined') {
        return gameEventsChannel;
    }

    if (gameEventsChannel) {
        try {
            gameEventsChannel.unsubscribe();
        } catch (e) {
        }
    }

    gameEventsChannel = supabase.channel(`${cleanLobbyId}-game-events`, {
        config: {
            broadcast: { self: false },
        },
    });
    gameEventsLobbyId = cleanLobbyId;

    return gameEventsChannel;
};

export const cleanupGameEventsChannel = () => {
    if (gameEventsChannel) {
        try {
            gameEventsChannel.unsubscribe();
        } catch (e) {
            // Ignore
        }
        gameEventsChannel = null;
        gameEventsLobbyId = null;
    }
};

export const createChannel = (lobbyId: string, userId: string): RealtimeChannel => {
    const cleanLobbyId = lobbyId.replace(/[^a-zA-Z0-9_-]/g, '');
    const channelKey = `lobby:${cleanLobbyId}`;

    if (activeChannels.has(channelKey)) {
        return activeChannels.get(channelKey)!;
    }

    const channel = supabase.channel(cleanLobbyId, {
        config: {
            broadcast: { self: false },
            presence: { key: userId },
        },
    });

    activeChannels.set(channelKey, channel);

    channel.on('system', { event: 'disconnect' }, () => {
        // console.log(`Channel disconnected: ${cleanLobbyId}`);
    });

    channel.on('system', { event: 'close' }, () => {
        activeChannels.delete(channelKey);
    });

    channel.on('system', { event: 'error' }, (error) => {
        console.error(`Channel error for ${cleanLobbyId}:`, error);
    });

    return channel;
};

export const forceCreateChannel = (lobbyId: string, userId: string): RealtimeChannel => {
    const cleanLobbyId = lobbyId.replace(/[^a-zA-Z0-9_-]/g, '');
    const channelKey = `lobby:${cleanLobbyId}`;

    if (activeChannels.has(channelKey)) {
        const oldChannel = activeChannels.get(channelKey)!;
        oldChannel.unsubscribe();
        activeChannels.delete(channelKey);
    }

    const channel = supabase.channel(cleanLobbyId, {
        config: {
            broadcast: { self: false },
            presence: { key: userId },
        },
    });

    activeChannels.set(channelKey, channel);

    channel.on('system', { event: 'disconnect' }, () => {
        // console.log(`Channel disconnected: ${cleanLobbyId}`);
    });

    channel.on('system', { event: 'close' }, () => {
        activeChannels.delete(channelKey);
    });

    channel.on('system', { event: 'error' }, (error) => {
        console.error(`Channel error for ${cleanLobbyId}:`, error);
    });

    return channel;
};

export const broadcastReady = async (channel: RealtimeChannel, userId: string, ready: boolean): Promise<boolean> => {
    try {
        const result = await channel.send({
            type: 'broadcast',
            event: 'ready',
            payload: { user_id: userId, ready },
        });
        return result === 'ok';
    } catch (error) {
        console.warn("Failed to broadcast ready status:", error);
        return false;
    }
};

export const broadcastStartGame = async (channel: RealtimeChannel, gameData: StartGamePayload): Promise<boolean> => {
    try {
        const result = await channel.send({
            type: 'broadcast',
            event: 'start_game',
            payload: gameData,
        });
        return result === 'ok';
    } catch (error) {
        console.warn("Failed to broadcast game start:", error);
        return false;
    }
};

export const broadcastRevealImposter = async (channel: RealtimeChannel): Promise<boolean> => {
    try {
        const result = await channel.send({
            type: 'broadcast',
            event: 'reveal_imposter',
            payload: { reveal: true },
        });
        return result === 'ok';
    } catch (error) {
        console.warn("Failed to broadcast reveal imposter:", error);
        return false;
    }
};

export const broadcastPlayAgain = async (channel: RealtimeChannel, gameData: StartGamePayload): Promise<boolean> => {
    try {
        const result = await channel.send({
            type: 'broadcast',
            event: 'play_again',
            payload: gameData,
        });
        return result === 'ok';
    } catch (error) {
        console.warn("Failed to broadcast play again:", error);
        return false;
    }
};

export const broadcastBackToLobby = async (channel: RealtimeChannel): Promise<boolean> => {
    try {
        const result = await channel.send({
            type: 'broadcast',
            event: 'back_to_lobby',
            payload: { backToLobby: true },
        });
        return result === 'ok';
    } catch (error) {
        console.warn("Failed to broadcast back to lobby:", error);
        return false;
    }
};

export type GameSettingsPayload = {
    imposters: number;
    categories: { title: string }[];
};

export const broadcastGameSettings = async (channel: RealtimeChannel, settings: GameSettingsPayload): Promise<boolean> => {
    try {
        const result = await channel.send({
            type: 'broadcast',
            event: 'game_settings',
            payload: settings,
        });
        return result === 'ok';
    } catch (error) {
        console.warn("Failed to broadcast game settings:", error);
        return false;
    }
};

export const cleanupChannel = (lobbyId: string, userId?: string) => {
    const cleanLobbyId = lobbyId.replace(/[^a-zA-Z0-9_-]/g, '');
    const channelKey = `lobby:${cleanLobbyId}`;
    const channel = activeChannels.get(channelKey);

    if (channel) {
        try {
            channel.unsubscribe();
            activeChannels.delete(channelKey);
        } catch (error) {
            console.warn("Error during cleanup:", error);
        }
    }
};

export const cleanupAllGameChannels = async (lobbyId: string) => {
    const cleanLobbyId = lobbyId.replace(/[^a-zA-Z0-9_-]/g, '');

    const channelKey = `lobby:${cleanLobbyId}`;
    const existingChannel = activeChannels.get(channelKey);
    if (existingChannel) {
        try {
            existingChannel.unsubscribe();
        } catch (e) {
        }
        activeChannels.delete(channelKey);
    }

    cleanupGameEventsChannel();
};

export const isSupabaseConfigured = (): boolean => {
    return !!(supabaseUrl && supabaseAnonKey);
};