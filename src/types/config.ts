export interface CustomEmoji {
  custom: true;
  id: string;
  name: string;
}

export interface NormalEmoji {
  custom: false;
  name: string;
}

export interface StatusMessage {
  text: string;
  emoji?: CustomEmoji | NormalEmoji;
}

export interface StatusConfig {
  messages: StatusMessage[];
  interval: number;
  clearAfter: boolean;
}

export interface Config {
  token: string;
  statusConfig: StatusConfig;
} 