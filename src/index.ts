import { Client } from 'discord.js-selfbot-v13';
import { createStatusRotator } from './utils/status-rotator';
import { validateConfig } from './utils/config-validator';
import rawConfig from './config.json';

const client = new Client();
const config = validateConfig(rawConfig);

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.username}`);
  
  const cleanup = createStatusRotator(client, config.statusConfig);

  process.on('SIGINT', () => {
    cleanup();
    client.destroy();
    process.exit(0);
  });
});

client.login(config.token).catch(console.error); 