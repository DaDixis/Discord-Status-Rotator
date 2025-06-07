import { Client, ActivityOptions, PresenceData } from 'discord.js-selfbot-v13';
import { StatusConfig, StatusMessage } from '../types/config';

interface StatusRotatorCleanup {
    (): Promise<void>;
}

interface CustomActivity {
    type: 'CUSTOM';
    name: 'Custom Status';
    state: string;
    emoji?: {
        name?: string;
        id?: string;
    } | null;
}

export function createStatusRotator(client: Client, config: StatusConfig): StatusRotatorCleanup {
    let currentIndex = 0;
    let intervalId: NodeJS.Timeout | null = null;

    function getEmojiObject(message: StatusMessage) {
        if (!message.emoji) return null;
        
        try {
            if (message.emoji.custom && message.emoji.id) {
                return {
                    id: message.emoji.id,
                    name: message.emoji.name || undefined
                };
            }
            return message.emoji.name ? { name: message.emoji.name } : null;
        } catch (error) {
            console.error('Error processing emoji:', error);
            return null;
        }
    }

    async function setCustomStatus(): Promise<void> {
        try {
            if (!client.user) {
                throw new Error('Client user is not available');
            }

            const message = config.messages[currentIndex];
            if (!message) {
                throw new Error('Invalid message index');
            }

            const activity: CustomActivity = {
                type: 'CUSTOM',
                name: 'Custom Status',
                state: message.text,
                emoji: getEmojiObject(message)
            };

            await client.user.setPresence({
                activities: [activity]
            });
            
            currentIndex = (currentIndex + 1) % config.messages.length;
        } catch (error) {
            if (error instanceof Error && error.message.includes('rate limit')) {
                if (intervalId) {
                    clearInterval(intervalId);
                    await new Promise(resolve => setTimeout(resolve, 60000));
                    intervalId = setInterval(() => void setCustomStatus(), config.interval);
                }
            }
        }
    }

    const cleanup: StatusRotatorCleanup = async () => {
        try {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }

            if (config.clearAfter && client.user) {
                await client.user.setPresence({ activities: [] });
            }
        } catch (error) {
            console.error('Failed to cleanup status rotator:', error);
            throw error;
        }
    };

    try {
        console.log(`Status rotator started with ${config.messages.length} messages, updating every ${config.interval / 1000}s`);
        void setCustomStatus();
        intervalId = setInterval(() => void setCustomStatus(), config.interval);
        return cleanup;
    } catch (error) {
        console.error('Failed to initialize status rotator:', error);
        void cleanup();
        throw error;
    }
} 