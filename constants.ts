import { Server } from './types';

export const MOCK_SERVERS: Server[] = [
  {
    id: 'us-east-1',
    country: 'United States',
    city: 'New York',
    flag: '🇺🇸',
    ping: 45,
    load: 62,
    ip: '104.23.11.90',
    premium: false,
    features: ['Streaming', 'P2P']
  },
  {
    id: 'uk-lon-1',
    country: 'United Kingdom',
    city: 'London',
    flag: '🇬🇧',
    ping: 89,
    load: 45,
    ip: '185.20.12.4',
    premium: true,
    features: ['BBC iPlayer', 'Security']
  },
  {
    id: 'de-fra-1',
    country: 'Germany',
    city: 'Frankfurt',
    flag: '🇩🇪',
    ping: 102,
    load: 30,
    ip: '190.12.44.11',
    premium: false,
    features: ['Privacy', 'No-Log']
  },
  {
    id: 'sg-sin-1',
    country: 'Singapore',
    city: 'Singapore',
    flag: '🇸🇬',
    ping: 210,
    load: 15,
    ip: '120.33.1.55',
    premium: true,
    features: ['Gaming', 'Low Latency']
  },
  {
    id: 'in-mum-1',
    country: 'India',
    city: 'Mumbai',
    flag: '🇮🇳',
    ping: 250,
    load: 78,
    ip: '103.11.20.1',
    premium: false,
    features: ['Virtual Location']
  },
  {
    id: 'jp-tok-1',
    country: 'Japan',
    city: 'Tokyo',
    flag: '🇯🇵',
    ping: 180,
    load: 40,
    ip: '45.12.99.10',
    premium: true,
    features: ['Anime', 'Streaming']
  }
];

export const APP_NAME = "ShieldFlow VPN";
export const GEMINI_MODEL = "gemini-3-flash-preview";