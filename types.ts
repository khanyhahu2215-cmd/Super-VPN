export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING'
}

export interface Server {
  id: string;
  country: string;
  city: string;
  flag: string;
  ping: number;
  load: number; // 0-100%
  ip: string;
  premium: boolean;
  features: string[]; // e.g., 'Streaming', 'P2P', 'Double VPN'
}

export interface TrafficPoint {
  time: string;
  download: number; // Mbps
  upload: number; // Mbps
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface UserPreferences {
  protocol: 'WireGuard' | 'OpenVPN' | 'IKEv2';
  killSwitch: boolean;
  autoConnect: boolean;
}