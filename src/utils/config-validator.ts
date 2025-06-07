import { Config, StatusConfig, CustomEmoji, NormalEmoji } from '../types/config';

function isCustomEmoji(emoji: any): emoji is CustomEmoji {
  return (
    typeof emoji === 'object' &&
    emoji !== null &&
    emoji.custom === true &&
    typeof emoji.id === 'string' &&
    typeof emoji.name === 'string'
  );
}

function isNormalEmoji(emoji: any): emoji is NormalEmoji {
  return (
    typeof emoji === 'object' &&
    emoji !== null &&
    emoji.custom === false &&
    typeof emoji.name === 'string'
  );
}

export function validateConfig(config: any): Config {
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid config format');
  }

  if (!config.token || typeof config.token !== 'string') {
    throw new Error('Invalid or missing token in config');
  }

  if (!config.statusConfig || typeof config.statusConfig !== 'object') {
    throw new Error('Invalid or missing statusConfig in config');
  }

  const statusConfig = config.statusConfig as StatusConfig;

  if (!Array.isArray(statusConfig.messages)) {
    throw new Error('Messages must be an array');
  }

  if (!config.statusConfig.interval || typeof config.statusConfig.interval !== 'number' || config.statusConfig.interval < 1000) {
    throw new Error('Invalid interval: must be a number >= 1000ms');
  }

  if (typeof config.statusConfig.clearAfter !== 'boolean') {
    throw new Error('clearAfter must be a boolean');
  }

  if (config.statusConfig.messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }

  statusConfig.messages.forEach((message, index) => {
    if (typeof message.text !== 'string' || message.text.trim() === '') {
      throw new Error(`Invalid or empty text in message at index ${index}`);
    }

    if (message.emoji !== undefined) {
      if (!isCustomEmoji(message.emoji) && !isNormalEmoji(message.emoji)) {
        throw new Error(`Invalid emoji format in message at index ${index}`);
      }
      if (isCustomEmoji(message.emoji) && message.emoji.id.trim() === '') {
        throw new Error(`Custom emoji ID cannot be empty at index ${index}`);
      }
    }
  });

  return config as Config;
} 